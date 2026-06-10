"use client";

import React, { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Mail,
  Phone,
  User,
  Search,
} from "lucide-react";
import {
  createCustomerAction,
  deleteCustomerAction,
  updateCustomerAction,
} from "../actions";
import { FormInput } from "../../components/input";
import { ModalBarber } from "../../components/modal-barber";
import { formatDate, formatPhone } from "@/utils/formaters";

interface CustomerWithCounts {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  createdAt: Date;
  _count: {
    appointments: number;
  };
  lastAppointment: {
    barberService: {
      service: {
        name: string;
      };
    };
    startsAt: Date;
  } | null;
}

interface CustomersClientProps {
  initialCustomers: CustomerWithCounts[];
}

export function CustomersClient({ initialCustomers }: CustomersClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return initialCustomers;

    const query = searchQuery.toLowerCase();
    return initialCustomers.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.email?.toLowerCase().includes(query) ||
        c.phone?.includes(query)
    );
  }, [initialCustomers, searchQuery]);

  // Open modal for creating or editing
  const handleOpenModal = (customer?: CustomerWithCounts) => {
    if (customer) {
      setEditingId(customer.id);
      setName(customer.name);
      setEmail(customer.email || "");
      setPhone(customer.phone || "");
    } else {
      setEditingId(null);
      setName("");
      setEmail("");
      setPhone("");
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

    startTransition(async () => {
      let res;

      if (editingId) {
        res = await updateCustomerAction({
          id: editingId,
          name,
          email,
          phone,
        });
      } else {
        res = await createCustomerAction({
          name,
          email,
          phone,
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

  function handleDeleteCustomer(customerId: string) {
    const confirmed = window.confirm("Deseja realmente excluir este cliente?");

    if (!confirmed) return;

    startTransition(async () => {
      const res = await deleteCustomerAction(customerId);
      if (res.success) {
        router.refresh();
      } else {
        alert(res.error || "Erro ao excluir o cliente.");
      }
    });
  }

  const isEditing = !!editingId;
  const modalTitle = isEditing ? "Editar Cliente" : "Novo Cliente";
  const ModalIcon = isEditing ? Pencil : Users;

  return (
    <main className="flex-1 p-8 space-y-6">
      {/* Title and Action Button Row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Clientes
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {initialCustomers.length}{" "}
            {initialCustomers.length === 1 ? "cadastrado" : "cadastrados"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-56 rounded-lg border border-border bg-white pl-10 pr-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber focus:border-amber transition-all"
            />
          </div>

          <button
            type="button"
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber to-amber-light px-4 py-2.5 text-sm font-bold text-navy-dark transition-all hover:scale-105 hover:shadow-lg hover:shadow-amber/20 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Novo Cliente
          </button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        {initialCustomers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-slate-400 mb-4 border border-border">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">Nenhum cliente cadastrado</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">
              Cadastre clientes para começar a gerenciar seus agendamentos e histórico de serviços.
            </p>
            <button
              type="button"
              onClick={() => handleOpenModal()}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber to-amber-light px-4 py-2 text-sm font-bold text-navy-dark transition-all hover:scale-105 hover:shadow-md hover:shadow-amber/20 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Cadastrar Primeiro Cliente
            </button>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-slate-400 mb-4 border border-border">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">Nenhum resultado encontrado</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">
              Não encontramos clientes com o termo &ldquo;{searchQuery}&rdquo;. Tente uma busca diferente.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-200 border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Cliente
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Telefone
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Agendamentos
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Último Serviço
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Cadastro
                  </th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50/30 transition-colors">
                    {/* CLIENTE */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4.5">
                        {/* Avatar with initials */}
                        <div className="relative h-12 w-12 shrink-0 rounded-full overflow-hidden bg-slate-100 ring-2 ring-white shadow-md transition-transform hover:scale-105">
                          <div className="flex h-full w-full items-center justify-center bg-slate-200 text-slate-600 font-bold text-sm tracking-wider">
                            {customer.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                        </div>

                        {/* Info */}
                        <div className="flex flex-col justify-center">
                          <span className="text-sm font-bold text-slate-950 tracking-tight leading-none">
                            {customer.name}
                          </span>
                          <span className="text-xs text-slate-400 mt-1">
                            {customer.email || "Sem e-mail"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* TELEFONE */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">
                        {formatPhone(customer.phone) || "—"}
                      </span>
                    </td>

                    {/* AGENDAMENTOS */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-700 text-center block">
                        {customer._count.appointments}
                      </span>
                    </td>

                    {/* ÚLTIMO SERVIÇO */}
                    <td className="px-6 py-4">
                      {customer.lastAppointment ? (
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-amber-dark">
                            {customer.lastAppointment.barberService.service.name}
                          </span>
                          <span className="text-xs text-slate-400 mt-0.5">
                            {formatDate(customer.lastAppointment.startsAt)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">—</span>
                      )}
                    </td>

                    {/* CADASTRO */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">
                        {formatDate(customer.createdAt)}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => handleOpenModal(customer)}
                          className="p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                          title="Editar cliente"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="p-1 text-red-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Excluir cliente"
                          onClick={() => handleDeleteCustomer(customer.id)}
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
              id="customer-name"
              label="Nome"
              icon={User}
              type="text"
              required
              placeholder="Ex: Lucas Almeida"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <FormInput
              id="customer-email"
              label="E-mail"
              icon={Mail}
              type="email"
              optional
              placeholder="Ex: lucas@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isPending}
            />
          </div>

          {/* Telefone */}
          <div className="space-y-1.5">
            <FormInput
              id="customer-phone"
              label="Telefone"
              icon={Phone}
              type="tel"
              optional
              placeholder="Ex: (11) 98888-0001"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isPending}
            />
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
              className="px-4 py-2 text-sm font-bold text-navy-dark bg-gradient-to-r from-amber to-amber-light hover:brightness-110 rounded-lg transition-all flex items-center gap-1.5 justify-center cursor-pointer disabled:opacity-50 disabled:hover:brightness-100 shadow-sm"
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
