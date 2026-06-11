"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Scissors,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ToggleLeft,
  ToggleRight,
  Store,
  DollarSign,
  Clock,
  Users,
} from "lucide-react";
import {
  createServiceAction,
  deleteServiceAction,
  updateServiceAction,
  setServiceStatusAction,
} from "../actions";
import { FormInput } from "../../components/input";
import { ModalBarber } from "../../components/modal-barber";
import { ActionButton } from "@/components/ui/action-button";
import { ModalFooter } from "@/components/ui/modal-footer";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusToggle } from "@/components/ui/status-toggle";

export interface ServiceWithCounts {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: string | null;
  price: number;
  isActive: boolean;
  _count: {
    barberServices: number;
  };
}

interface ServicesClientProps {
  initialServices: ServiceWithCounts[];
}

export function ServicesClient({ initialServices }: ServicesClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [price, setPrice] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Open modal for creating or editing
  const handleOpenModal = (service?: ServiceWithCounts) => {
    if (service) {
      setEditingId(service.id);
      setName(service.name);
      setDescription(service.description || "");
      setDurationMinutes(service.durationMinutes || "");
      setPrice(service.price.toString());
      setIsActive(service.isActive);
    } else {
      setEditingId(null);
      setName("");
      setDescription("");
      setDurationMinutes("");
      setPrice("");
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

    const priceNum = parseFloat(price.replace(",", "."));
    if (isNaN(priceNum) || priceNum < 0) {
      setError("Insira um preço válido.");
      return;
    }

    startTransition(async () => {
      let res;

      const data = {
        name,
        description,
        durationMinutes,
        price: priceNum,
        isActive,
      };

      if (editingId) {
        res = await updateServiceAction({ id: editingId, ...data });
      } else {
        res = await createServiceAction(data);
      }

      if (res.success) {
        setIsModalOpen(false);
        router.refresh();
      } else {
        setError(res.error || "Algo deu errado. Tente novamente.");
      }
    });
  };

  function handleDeleteService(serviceId: string) {
    const confirmed = window.confirm("Deseja realmente excluir este serviço?");

    if (!confirmed) return;

    startTransition(async () => {
      const res = await deleteServiceAction(serviceId);
      if (res.success) {
        router.refresh();
      } else {
        alert(res.error || "Erro ao excluir o serviço.");
      }
    });
  }

  function handleSetStatus(serviceId: string, currentStatus: boolean) {
    startTransition(async () => {
      const res = await setServiceStatusAction(serviceId, !currentStatus);
      if (res.success) {
        router.refresh();
      } else {
        alert(res.error || "Erro ao alterar o status do serviço.");
      }
    });
  }

  const isEditing = !!editingId;
  const modalTitle = isEditing ? "Editar Serviço" : "Novo Serviço";
  const ModalIcon = isEditing ? Pencil : Scissors;

  const activeServicesCount = initialServices.filter((s) => s.isActive).length;

  return (
    <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Title and Action Button Row */}
      <PageHeader
        title="Serviços"
        subtitle={`${activeServicesCount} ativos de ${initialServices.length} cadastrados`}
      >
        <ActionButton onClick={() => handleOpenModal()}>
          Novo Serviço
        </ActionButton>
      </PageHeader>

      {/* Services Grid */}
      {initialServices.length === 0 ? (
        <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
          <EmptyState
            icon={Scissors}
            title="Nenhum serviço cadastrado"
            description="Cadastre os serviços que sua barbearia oferece para que os clientes possam agendar."
          >
            <ActionButton onClick={() => handleOpenModal()}>
              Cadastrar Primeiro Serviço
            </ActionButton>
          </EmptyState>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {initialServices.map((service) => (
            <div
              key={service.id}
              className={`group relative rounded-2xl border border-border bg-white shadow-sm hover:shadow-xl overflow-hidden flex flex-col transition-all duration-300 ${!service.isActive ? "opacity-80 grayscale-30" : ""
                }`}
            >
              {/* Top Accent Line */}
              <div
                className={`h-1 w-full transition-colors duration-300 ${service.isActive ? "bg-linear-to-r from-amber to-amber-light" : "bg-slate-200"
                  }`}
              />

              {/* Card Main Content */}
              <div className="p-5 flex flex-col flex-1">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    {/* Icon Box */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-amber/10 to-amber/5 text-amber border border-amber/20 shadow-inner group-hover:scale-105 transition-transform duration-300">
                      <Store className="h-6 w-6 drop-shadow-sm" />
                    </div>

                    {/* Title and Status Badge */}
                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-tight truncate max-w-37.5 sm:max-w-45">
                        {service.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${service.isActive
                            ? "bg-success/10 text-success"
                            : "bg-slate-100 text-slate-500"
                          }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${service.isActive ? "bg-success" : "bg-slate-400"}`}></span>
                          {service.isActive ? "Ativo" : "Inativo"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Status Toggle */}
                  <button
                    type="button"
                    onClick={() => handleSetStatus(service.id, service.isActive)}
                    className="shrink-0 transition-transform active:scale-95"
                    title={service.isActive ? "Desativar serviço" : "Ativar serviço"}
                  >
                    {service.isActive ? (
                      <ToggleRight className="h-7 w-7 text-success transition-colors duration-300" />
                    ) : (
                      <ToggleLeft className="h-7 w-7 text-slate-300 hover:text-slate-400 transition-colors duration-300" />
                    )}
                  </button>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-500 mt-4 line-clamp-2 min-h-10 leading-relaxed">
                  {service.description || "Nenhuma descrição fornecida para este serviço."}
                </p>

                {/* Info Tags / Pills */}
                <div className="mt-5 flex flex-wrap gap-2">
                  <div className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 border border-slate-100 transition-colors group-hover:bg-amber-50/50 group-hover:border-amber/10">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {service.durationMinutes ? `${service.durationMinutes} min` : "—"}
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 border border-slate-100 transition-colors group-hover:bg-amber-50/50 group-hover:border-amber/10">
                    <DollarSign className="h-3.5 w-3.5 text-amber-dark" />
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(service.price)}
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 border border-slate-100 transition-colors group-hover:bg-amber-50/50 group-hover:border-amber/10" title="Barbeiros que oferecem este serviço">
                    <Users className="h-3.5 w-3.5 text-blue-500" />
                    {service._count.barberServices}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="px-5 py-3.5 border-t border-border/50 bg-slate-50/50 flex items-center justify-between gap-3 transition-colors duration-300 group-hover:bg-white">
                <button
                  type="button"
                  onClick={() => handleOpenModal(service)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold text-slate-600 hover:text-amber-dark bg-white border border-border hover:border-amber/30 rounded-xl transition-all shadow-sm hover:shadow-amber/10 hover:bg-amber-50/30"
                >
                  <Pencil className="h-4 w-4" />
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteService(service.id)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center text-slate-400 hover:text-red-600 bg-white hover:bg-red-50 rounded-xl transition-colors border border-border hover:border-red-200 shadow-sm"
                  title="Excluir serviço"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal (Create / Edit) */}
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
              id="service-name"
              label="Nome do Serviço"
              icon={Store}
              type="text"
              required
              placeholder="Ex: Corte Degadê"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-800">
              Descrição
              <span className="text-xs text-slate-400 font-normal ml-1">
                (Opcional)
              </span>
            </label>
            <textarea
              id="service-description"
              placeholder="Descreva o serviço brevemente..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isPending}
              rows={3}
              className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber focus:border-amber transition-all disabled:opacity-50 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Duração */}
            <div className="space-y-1.5">
              <FormInput
                id="service-duration"
                label="Duração (min)"
                icon={Clock}
                type="number"
                optional
                placeholder="Ex: 45"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                disabled={isPending}
              />
            </div>

            {/* Preço */}
            <div className="space-y-1.5">
              <FormInput
                id="service-price"
                label="Preço Base"
                icon={DollarSign}
                type="number"
                step="0.01"
                required
                placeholder="Ex: 35.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={isPending}
              />
            </div>
          </div>

          {/* Status Toggle */}
          <StatusToggle
            label="Serviço Ativo"
            description="Determina se o serviço estará disponível para novos agendamentos."
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
    </main>
  );
}
