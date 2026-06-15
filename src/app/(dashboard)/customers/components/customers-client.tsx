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
import { ActionButton } from "@/components/ui/action-button";
import { ModalFooter } from "@/components/ui/modal-footer";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";

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
    <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Title and Action Button Row */}
      <PageHeader
        title="Clientes"
        subtitle={`${initialCustomers.length} ${initialCustomers.length === 1 ? "cadastrado" : "cadastrados"}`}
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
          Novo Cliente
        </ActionButton>
      </PageHeader>

      {/* Customers Table */}
      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        {initialCustomers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Nenhum cliente cadastrado"
            description="Cadastre clientes para começar a gerenciar seus agendamentos e histórico de serviços."
          >
            <ActionButton onClick={() => handleOpenModal()}>
              Cadastrar Primeiro Cliente
            </ActionButton>
          </EmptyState>
        ) : filteredCustomers.length === 0 ? (
          <EmptyState
            icon={Search}
            title="Nenhum resultado encontrado"
            description={`Não encontramos clientes com o termo "${searchQuery}". Tente uma busca diferente.`}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-200 border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-slate-50/50">
                  <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Cliente
                  </th>
                  <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Telefone
                  </th>
                  <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Agendamentos
                  </th>
                  <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Último Serviço
                  </th>
                  <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Cadastro
                  </th>
                  <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-3.5 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50/30 transition-colors">
                    {/* CLIENTE */}
                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        {/* Avatar with initials */}
                        <div className="relative h-8 sm:h-10 w-8 sm:w-10 shrink-0 rounded-full overflow-hidden bg-slate-100 ring-1 ring-border shadow-sm transition-transform hover:scale-105">
                          <div className="flex h-full w-full items-center justify-center bg-navy text-amber font-bold text-xs sm:text-sm tracking-wider">
                            {customer.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                        </div>

                        <div className="flex flex-col justify-center">
                          <span className="text-xs sm:text-sm font-bold text-slate-950 tracking-tight leading-none">
                            {customer.name}
                          </span>
                          <span className="text-[11px] text-slate-400 mt-0.5 hidden sm:inline">
                            {customer.email || "Sem e-mail"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* TELEFONE */}
                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                      <span className="text-[13px] text-slate-600">
                        {formatPhone(customer.phone) || "—"}
                      </span>
                    </td>

                    {/* AGENDAMENTOS */}
                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                      <span className="text-[13px] font-medium text-slate-700 text-center block">
                        {customer._count.appointments}
                      </span>
                    </td>

                    {/* ÚLTIMO SERVIÇO */}
                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                      {customer.lastAppointment ? (
                        <div className="flex flex-col">
                          <span className="text-[13px] font-medium text-amber-dark">
                            {customer.lastAppointment.barberService.service.name}
                          </span>
                          <span className="text-[11px] text-slate-400 mt-0.5">
                            {formatDate(customer.lastAppointment.startsAt)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[13px] text-slate-400">—</span>
                      )}
                    </td>

                    {/* CADASTRO */}
                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                      <span className="text-[13px] text-slate-600">
                        {formatDate(customer.createdAt)}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 sm:gap-2">
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
        <form onSubmit={handleSubmit} className="flex-1 p-4 sm:p-6 space-y-4">
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
