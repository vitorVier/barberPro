"use client";

import React, { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Scissors,
  ToggleLeft,
  ToggleRight,
  Pencil,
  Trash2,
  Mail,
  Phone,
  User,
  Image as ImageIcon,
  Upload,
  Search,
  CalendarDays,
} from "lucide-react";
import {
  createBarberAction,
  deleteBarberAction,
  setBarberStatusAction,
  updateBarberAction
} from "../actions";
import { FormInput } from "../../components/input";
import { ModalBarber } from "../../components/modal-barber";
import { ModalBarberServices } from "./modal-barber-services";
import { formatPhone } from "@/utils/formaters";
import { ActionButton } from "@/components/ui/action-button";
import { ModalFooter } from "@/components/ui/modal-footer";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusToggle } from "@/components/ui/status-toggle";

interface BarberWithCounts {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  _count: {
    barberService: number;
    appointments: number;
  };
}

interface BarbersClientProps {
  initialBarbers: BarberWithCounts[];
}

export function BarbersClient({ initialBarbers }: BarbersClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado para rastrear se estamos editando um barbeiro específico
  const [editingId, setEditingId] = useState<string | null>(null);

  // Estados para o Modal de Serviços
  const [isServicesModalOpen, setIsServicesModalOpen] = useState(false);
  const [selectedBarberForServices, setSelectedBarberForServices] = useState<{id: string, name: string} | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(""); // Armazenará a URL ou o Base64 da foto
  const [isActive, setIsActive] = useState(true);

  // Função para ler o arquivo e converter em Base64
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validação simples de tamanho (ex: limite de 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("A imagem deve ter no máximo 2MB.");
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      // O result será uma string em formato DataURL/Base64
      setAvatarUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Abre o modal para Criação (vazio) ou Edição (com dados)
  const handleOpenModal = (barber?: BarberWithCounts) => {
    if (barber) {
      setEditingId(barber.id);
      setName(barber.name);
      setEmail(barber.email);
      setPhone(barber.phone || "");
      setAvatarUrl(barber.avatarUrl || "");
      setIsActive(barber.isActive);
    } else {
      setEditingId(null);
      setName("");
      setEmail("");
      setPhone("");
      setAvatarUrl("");
      setIsActive(true);
    }
    setError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isPending) return;
    setIsModalOpen(false);
    setTimeout(() => setEditingId(null), 200);
  };

  const handleOpenServicesModal = (barber: BarberWithCounts) => {
    setSelectedBarberForServices({ id: barber.id, name: barber.name });
    setIsServicesModalOpen(true);
  };

  const handleCloseServicesModal = () => {
    setIsServicesModalOpen(false);
    setTimeout(() => setSelectedBarberForServices(null), 200);
    // Refresh to get updated service counts if any changed
    router.refresh();
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("O nome é obrigatório.");
      return;
    }
    if (!email.trim()) {
      setError("O e-mail é obrigatório.");
      return;
    }

    startTransition(async () => {
      let res;

      if (editingId) {
        res = await updateBarberAction({
          id: editingId,
          name,
          email,
          phone,
          avatarUrl,
          isActive,
        });
      } else {
        res = await createBarberAction({
          name,
          email,
          phone,
          avatarUrl,
          isActive,
        });
      }

      if (res.success) {
        setIsModalOpen(false);
        router.refresh();
      } else {
        setError(res.error || "Algo deu errado. Tente novamente.");
      }
    });
  };

  function handleSetStatus(barberId: string, status: boolean) {
    const changedStatus = !status;

    startTransition(async () => {
      const res = await setBarberStatusAction({
        barberId,
        isActive: changedStatus,
      });

      if (res.success) router.refresh();
    });
  }

  function handleDeleteBarber(barberId: string) {
    const confirmed = window.confirm("Deseja realmente excluir este barbeiro?");

    if (!confirmed) return;

    startTransition(async () => {
      await deleteBarberAction(barberId);
      router.refresh();
    });
  }

  const isEditing = !!editingId;
  const modalTitle = isEditing ? "Editar Barbeiro" : "Novo Barbeiro";
  const ModalIcon = isEditing ? Pencil : Scissors;

  // Filtered barbers
  const filteredBarbers = useMemo(() => {
    if (!searchQuery.trim()) return initialBarbers;

    const query = searchQuery.toLowerCase();
    return initialBarbers.filter(
      (b) =>
        b.name.toLowerCase().includes(query) ||
        b.email.toLowerCase().includes(query) ||
        b.phone?.includes(query)
    );
  }, [initialBarbers, searchQuery]);

  return (
    <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Title and Action Button Row */}
      <PageHeader
        title="Barbeiros"
        subtitle={`${initialBarbers.length} ${initialBarbers.length === 1 ? "cadastrado" : "cadastrados"}`}
      >
        {/* Search Input */}
        <div className="relative w-full sm:w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 sm:h-10 w-full rounded-lg border border-border bg-white pl-10 pr-3 text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber focus:border-amber transition-all"
          />
        </div>

        <ActionButton onClick={() => handleOpenModal()}>
          Novo Barbeiro
        </ActionButton>
      </PageHeader>

      {/* Barbers Grid */}
      {initialBarbers.length === 0 ? (
        <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
          <EmptyState
            icon={Scissors}
            title="Nenhum barbeiro cadastrado"
            description="Cadastre barbeiros para começar a gerenciar sua equipe e disponibilizar serviços para agendamento."
          >
            <ActionButton onClick={() => handleOpenModal()}>
              Cadastrar Primeiro Barbeiro
            </ActionButton>
          </EmptyState>
        </div>
      ) : filteredBarbers.length === 0 ? (
        <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
          <EmptyState
            icon={Search}
            title="Nenhum resultado encontrado"
            description={`Não encontramos barbeiros com o termo "${searchQuery}". Tente uma busca diferente.`}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-2.5 sm:gap-3 md:gap-4">
          {filteredBarbers.map((barber) => (
            <div
              key={barber.id}
              className={`group relative rounded-2xl border border-border bg-white shadow-sm hover:shadow-xl overflow-hidden flex flex-col transition-all duration-300 ${!barber.isActive ? "opacity-80 grayscale-30" : ""}`}
            >
              {/* Top Accent Line */}
              <div className={`h-1 w-full transition-colors duration-300 ${barber.isActive ? "bg-linear-to-r from-amber to-amber-light" : "bg-slate-200"}`} />

              {/* Status Toggle — Top Right */}
              <button
                type="button"
                onClick={() => handleSetStatus(barber.id, barber.isActive)}
                className="absolute top-3 right-3 z-10 shrink-0 transition-transform active:scale-95"
                title={barber.isActive ? "Desativar barbeiro" : "Ativar barbeiro"}
              >
                {barber.isActive ? (
                  <ToggleRight className="h-6 w-6 text-success transition-colors duration-300" />
                ) : (
                  <ToggleLeft className="h-6 w-6 text-slate-300 hover:text-slate-400 transition-colors duration-300" />
                )}
              </button>

              {/* Card Content */}
              <div className="px-4 pt-5 pb-4 flex flex-col flex-1 items-center text-center">

                {/* Centered Avatar */}
                <div className="h-16 w-16 rounded-full overflow-hidden bg-slate-100 ring-4 ring-slate-50 shadow-md transition-transform duration-300 group-hover:scale-105 mb-3">
                  {barber.avatarUrl ? (
                    <img
                      src={barber.avatarUrl}
                      alt={barber.name}
                      className="h-full w-full object-cover object-center select-none"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-navy-light to-navy text-amber font-bold text-lg tracking-wider">
                      {barber.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Name */}
                <h3 className="text-sm font-bold text-slate-900 leading-tight">{barber.name}</h3>

                {/* Status Badge */}
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider mt-1.5 ${barber.isActive
                  ? "bg-success/10 text-success"
                  : "bg-slate-100 text-slate-500"
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${barber.isActive ? "bg-success" : "bg-slate-400"}`}></span>
                  {barber.isActive ? "Ativo" : "Inativo"}
                </span>

                {/* Contact Info */}
                <div className="mt-4 w-full space-y-1.5 text-left">
                  <div className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-700 transition-colors">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                      <Mail className="h-3 w-3" />
                    </div>
                    <span className="truncate">{barber.email}</span>
                  </div>
                  {barber.phone && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-700 transition-colors">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                        <Phone className="h-3 w-3" />
                      </div>
                      <span>{formatPhone(barber.phone)}</span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="mt-auto pt-3 w-full grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => handleOpenServicesModal(barber)}
                    className="flex flex-col items-center gap-0.5 rounded-xl bg-slate-50 border border-slate-100 py-2 px-1.5 transition-colors hover:bg-amber-50 hover:border-amber/20 cursor-pointer group/stat"
                    title="Gerenciar serviços"
                  >
                    <div className="flex items-center gap-1">
                      <Scissors className="h-3 w-3 text-amber" />
                      <span className="text-base font-bold text-slate-800 group-hover/stat:text-amber-dark">{barber._count.barberService}</span>
                    </div>
                    <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">Serviços</span>
                  </button>
                  <div
                    className="flex flex-col items-center gap-0.5 rounded-xl bg-slate-50 border border-slate-100 py-2 px-1.5"
                    title="Total de agendamentos"
                  >
                    <div className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3 text-blue-500" />
                      <span className="text-base font-bold text-slate-800">{barber._count.appointments}</span>
                    </div>
                    <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">Agendamentos</span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="px-4 py-3 border-t border-border/50 bg-slate-50/50 flex items-center gap-2 transition-colors duration-300 group-hover:bg-white mt-auto">
                <button
                  type="button"
                  onClick={() => handleOpenModal(barber)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-amber-dark bg-white border border-border hover:border-amber/30 rounded-xl transition-all shadow-sm hover:shadow-amber/10 hover:bg-amber-50/30"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteBarber(barber.id)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center text-slate-400 hover:text-red-600 bg-white hover:bg-red-50 rounded-xl transition-colors border border-border hover:border-red-200 shadow-sm"
                  title="Excluir barbeiro"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dinâmico (Criação / Edição) */}
      <ModalBarber
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={modalTitle}
        icon={ModalIcon}
        disabled={isPending}
      >
        <form onSubmit={handleSubmit} className="flex-1 p-4 sm:p-6 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600 font-medium">
              {error}
            </div>
          )}

          {/* Nome */}
          <div className="space-y-1.5">
            <FormInput
              id="name"
              label="Nome"
              icon={User}
              type="text"
              required
              placeholder="Ex: João Silva"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <FormInput
              id="email"
              label="E-mail"
              icon={Mail}
              type="email"
              required
              placeholder="Ex: joao@barberpro.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isPending}
            />
          </div>

          {/* Telefone */}
          <div className="space-y-1.5">
            <FormInput
              id="phone"
              label="Telefone"
              icon={Phone}
              type="tel"
              optional
              placeholder="Ex: (11) 99999-1111"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isPending}
            />
          </div>

          {/* NOVO: Upload de Imagem customizado com Preview */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-slate-400" />
              Foto do Barbeiro
              <span className="text-xs font-normal text-slate-400">(Opcional)</span>
            </label>

            <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border border-border rounded-lg bg-slate-50/50">
              {/* Preview Circle */}
              <div className="relative group h-16 w-16 shrink-0 rounded-full overflow-hidden border border-border bg-slate-200 flex items-center justify-center shadow-inner">
                {avatarUrl ? (
                  <>
                    <img
                      src={avatarUrl}
                      alt="Preview do Barbeiro"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setAvatarUrl("")}
                      disabled={isPending}
                      className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:opacity-0"
                      title="Remover foto"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <User className="h-8 w-8 text-slate-400" />
                )}
              </div>

              {/* Upload Button */}
              <div className="flex-1 space-y-1">
                <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-sm transition-all active:scale-[0.98]">
                  <Upload className="h-3.5 w-3.5 text-slate-500" />
                  {avatarUrl ? "Alterar imagem" : "Escolher imagem"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={isPending}
                    onChange={handleImageChange}
                  />
                </label>
                <p className="text-[11px] text-slate-400">
                  Formatos aceitos: JPG, PNG. Máx: 2MB.
                </p>
              </div>
            </div>
          </div>

          {/* Status Toggle */}
          <StatusToggle
            label="Barbeiro Ativo"
            description="Determina se o barbeiro estará disponível para agendamentos."
            isActive={isActive}
            onToggle={() => setIsActive(!isActive)}
            disabled={isPending}
          />

          <ModalFooter
            onCancel={handleCloseModal}
            isPending={isPending}
            submitLabel="Salvar"
            cancelLabel="Cancelar"
          />
        </form>
      </ModalBarber>

      {/* Modal de Serviços do Barbeiro */}
      <ModalBarberServices
        isOpen={isServicesModalOpen}
        onClose={handleCloseServicesModal}
        barber={selectedBarberForServices}
      />
    </main>
  );
}