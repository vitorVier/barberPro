"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Scissors,
  Plus,
  ToggleLeft,
  ToggleRight,
  Pencil,
  Trash2,
  Loader2,
  Mail,
  Phone,
  User,
  Image as ImageIcon,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { 
  createBarberAction, 
  deleteBarberAction, 
  setBarberStatusAction,
  updateBarberAction
} from "../actions";
import { FormInput } from "../../components/input";
import { ModalBarber } from "../../components/modal-barber";
import { formatPhone } from "@/utils/formaters";

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
  const [isPending, startTransition] = useTransition();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para rastrear se estamos editando um barbeiro específico
  const [editingId, setEditingId] = useState<string | null>(null);

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

  return (
    <main className="flex-1 p-8 space-y-6">
      {/* Title and Action Button Row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Barbeiros
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {initialBarbers.length}{" "}
            {initialBarbers.length === 1 ? "cadastrado" : "cadastrados"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => handleOpenModal()} 
          className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-navy-light shadow-sm cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Novo Barbeiro
        </button>
      </div>

      {/* Barbers Card / Table */}
      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        {initialBarbers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-slate-400 mb-4 border border-border">
              <Scissors className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">Nenhum barbeiro cadastrado</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">
              Cadastre barbeiros para começar a gerenciar sua equipe e disponibilizar serviços para agendamento.
            </p>
            <button
              type="button"
              onClick={() => handleOpenModal()}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-navy-light shadow-sm cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Cadastrar Primeiro Barbeiro
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-200 border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Barbeiro</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Contato</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Serviços</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Agendamentos</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {initialBarbers.map((barber) => (
                  <tr key={barber.id} className="hover:bg-slate-50/30 transition-colors">
                    
                    {/* BARBEIRO */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4.5">
                        
                        {/* CONTAINER DO AVATAR */}
                        <div className="relative h-12 w-12 shrink-0 rounded-full overflow-hidden bg-slate-100 ring-2 ring-white shadow-md transition-transform hover:scale-105">
                          {barber.avatarUrl ? (
                            <img
                              src={barber.avatarUrl}
                              alt={barber.name}
                              className="h-full w-full object-cover object-center select-none"
                              style={{ imageRendering: "auto" }}
                            />
                          ) : (
                            /* PLACEHOLDER HUMANIZADO (Iniciais em vez de ícone rígido) */
                            <div className="flex h-full w-full items-center justify-center bg-slate-200 text-slate-600 font-bold text-sm tracking-wider">
                              {barber.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>

                        {/* INFORMAÇÕES DO TEXTO */}
                        <div className="flex flex-col justify-center">
                          <span className="text-sm font-bold text-slate-950 tracking-tight leading-none">
                            {barber.name}
                          </span>
                          {/* Opcional: Você pode trazer o e-mail ou cargo para baixo do nome para criar um bloco rico */}
                          <span className="text-xs text-slate-400 mt-1 md:hidden">
                            {barber.email}
                          </span>
                        </div>

                      </div>
                    </td>

                    {/* CONTATO */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-600">{barber.email}</span>
                        {barber.phone && (
                          <span className="text-xs text-slate-400 mt-0.5">{formatPhone(barber.phone)}</span>
                        )}
                      </div>
                    </td>

                    {/* SERVIÇOS */}
                    <td className="px-6 py-4">
                      <Link
                        href={`/barbeiros/${barber.id}/servicos`}
                        className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {barber._count.barberService}{" "}
                        {barber._count.barberService === 1 ? "serviço" : "serviços"}{" "}
                        <span className="ml-1 text-[10px]">&gt;</span>
                      </Link>
                    </td>

                    {/* AGENDAMENTOS */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-700">
                        {barber._count.appointments}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-4">
                      <div
                        onClick={() => handleSetStatus(barber.id, barber.isActive)}
                        title={barber.isActive ? "Clique para desativar" : "Clique para ativar"}
                        className="inline-flex items-center gap-1.5 cursor-pointer group select-none transition-opacity duration-150 active:opacity-75"
                      >
                        {barber.isActive ? (
                          <div className="flex items-center gap-1.5 text-success transition-colors duration-200 group-hover:text-emerald-600">
                            <ToggleRight className="h-5 w-5 stroke-[1.75] transition-transform duration-200 group-hover:scale-110" />
                            <span className="text-sm font-medium">Ativo</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-slate-400 transition-colors duration-200 group-hover:text-slate-500">
                            <ToggleLeft className="h-5 w-5 stroke-[1.75] transition-transform duration-200 group-hover:scale-110" />
                            <span className="text-sm font-medium">Inativo</span>
                          </div>
                        )}
                      </div>
                    </td>
                    
                    {/* ACTIONS */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => handleOpenModal(barber)} 
                          className="p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                          title="Editar barbeiro"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="p-1 text-red-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Excluir barbeiro"
                          onClick={() => handleDeleteBarber(barber.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Dinâmico (Criação / Edição) */}
      <ModalBarber
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={modalTitle}
        icon={ModalIcon}
        disabled={isPending}
      >
        <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-4">
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
            
            <div className="flex items-center gap-4 p-4 border border-border rounded-lg bg-slate-50/50">
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
          <div className="flex items-center justify-between rounded-lg border border-border p-3.5 bg-slate-50/50">
            <div className="space-y-0.5 pr-2">
              <label className="text-sm font-semibold text-slate-800">
                Barbeiro Ativo
              </label>
              <p className="text-xs text-slate-500">
                Determina se o barbeiro estará disponível para agendamentos.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              disabled={isPending}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
                isActive ? "bg-success" : "bg-slate-200"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isActive ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={handleCloseModal}
              disabled={isPending}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-sm font-semibold text-white bg-navy hover:bg-navy-light rounded-lg transition-all flex items-center gap-1.5 justify-center cursor-pointer disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar"
              )}
            </button>
          </div>
        </form>
      </ModalBarber>
    </main>
  );
}