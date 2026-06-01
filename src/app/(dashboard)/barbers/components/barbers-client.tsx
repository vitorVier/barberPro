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
  X,
  Loader2,
  Mail,
  Phone,
  User,
  Image,
} from "lucide-react";
import Link from "next/link";
import { createBarberAction, DeleteBarberAction, SetBarberStatusAction } from "../actions";
import { FormInput } from "../../components/input";

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

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Open & Close Handlers
  const handleOpenModal = () => {
    setName("");
    setEmail("");
    setPhone("");
    setAvatarUrl("");
    setIsActive(true);
    setError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isPending) return;
    setIsModalOpen(false);
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
      const res = await createBarberAction({
        name,
        email,
        phone,
        avatarUrl,
        isActive,
      });

      if (res.success) {
        setIsModalOpen(false);
        router.refresh();
      } else {
        setError(res.error || "Algo deu errado. Tente novamente.");
      }
    });
  };

  function handleSetStatus(barberId: string, status: boolean) {
    const changedStatus = !status

    startTransition(async () => {
     const res = await SetBarberStatusAction({
      barberId,
      isActive: changedStatus
     });

     if(res.success) router.refresh()
    })
  }

  function handleDeleteBarber(barberId: string) {
    const confirmed = window.confirm(
      "Deseja realmente excluir este barbeiro?"
    );

    if (!confirmed) return;

    startTransition(async () => {
      await DeleteBarberAction(barberId);
      router.refresh();
    });
  }

  return (
    <main className="flex-1 p-8 space-y-6">
      {/* Title and Action Button Row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Barbeiros</h1>
          <p className="text-sm text-slate-500 mt-1">
            {initialBarbers.length} {initialBarbers.length === 1 ? "cadastrado" : "cadastrados"}
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenModal}
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
              onClick={handleOpenModal}
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
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Barbeiro
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Contato
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Serviços
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Agendamentos
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {initialBarbers.map((barber) => (
                  <tr key={barber.id} className="hover:bg-slate-50/30 transition-colors">
                    {/* BARBEIRO */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {barber.avatarUrl ? (
                          <img
                            src={barber.avatarUrl}
                            alt={barber.name}
                            className="h-10 w-10 rounded-full object-cover border border-border"
                          />
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy text-amber">
                            <Scissors className="h-4.5 w-4.5" />
                          </div>
                        )}
                        <span className="text-sm font-semibold text-foreground">
                          {barber.name}
                        </span>
                      </div>
                    </td>

                    {/* CONTATO */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-600">{barber.email}</span>
                        {barber.phone && (
                          <span className="text-xs text-slate-400 mt-0.5">{barber.phone}</span>
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
                    <td className="px-6 py-4" onClick={() => handleSetStatus(barber.id, barber.isActive)}>
                      {barber.isActive ? (
                        <div className="inline-flex items-center gap-1.5 text-success">
                          <ToggleRight className="h-5 w-5 stroke-[1.75]" />
                          <span className="text-sm font-medium">Ativo</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 text-slate-400">
                          <ToggleLeft className="h-5 w-5 stroke-[1.75]" />
                          <span className="text-sm font-medium">Inativo</span>
                        </div>
                      )}
                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          type="button"
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

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl border border-border w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-slate-50/50">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Scissors className="h-5 w-5 text-amber" />
                Novo Barbeiro
              </h2>
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isPending}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
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

              {/* URL Avatar */}
              <div className="space-y-1.5">
                <FormInput
                  id="avatarUrl"
                  label="URL do Avatar"
                  icon={Image}
                  type="url"
                  optional
                  placeholder="Ex: https://images.unsplash.com/..."
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  disabled={isPending}
                />
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between rounded-lg border border-border p-3.5 bg-slate-50/50">
                <div className="space-y-0.5 pr-2">
                  <label className="text-sm font-semibold text-slate-800">Barbeiro Ativo</label>
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

              {/* Modal Actions */}
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
          </div>
        </div>
      )}
    </main>
  );
}
