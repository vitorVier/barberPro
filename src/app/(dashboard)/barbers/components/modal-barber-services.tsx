"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Scissors, X, Plus, Pencil, Trash2, Clock, DollarSign, Save } from "lucide-react";
import { 
  getBarberServicesAction, 
  getAvailableServicesAction, 
  allocateServiceAction, 
  updateAllocatedServiceAction, 
  removeAllocatedServiceAction 
} from "../barber-services-actions";

interface BarberInfo {
  id: string;
  name: string;
}

interface ModalBarberServicesProps {
  isOpen: boolean;
  onClose: () => void;
  barber: BarberInfo | null;
}

export function ModalBarberServices({ isOpen, onClose, barber }: ModalBarberServicesProps) {
  const [isPending, startTransition] = useTransition();
  const [allocatedServices, setAllocatedServices] = useState<any[]>([]);
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // States for adding a new service
  const [isAdding, setIsAdding] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [newPrice, setNewPrice] = useState<string>("");
  const [newDuration, setNewDuration] = useState<string>("");

  // States for inline editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<string>("");
  const [editDuration, setEditDuration] = useState<string>("");

  useEffect(() => {
    if (isOpen && barber) {
      fetchData();
      setIsAdding(false);
      setEditingId(null);
      setError(null);
    }
  }, [isOpen, barber]);

  const fetchData = async () => {
    if (!barber) return;
    setIsLoading(true);
    
    const [allocatedRes, availableRes] = await Promise.all([
      getBarberServicesAction(barber.id),
      getAvailableServicesAction(barber.id)
    ]);

    if (allocatedRes.success && allocatedRes.data) {
      setAllocatedServices(allocatedRes.data);
    }
    
    if (availableRes.success && availableRes.data) {
      setAvailableServices(availableRes.data);
    }
    
    setIsLoading(false);
  };

  const handleSelectServiceToAdd = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    if (!serviceId) {
      setNewPrice("");
      setNewDuration("");
      return;
    }
    
    const service = availableServices.find(s => s.id === serviceId);
    if (service) {
      setNewPrice(Number(service.price).toFixed(2));
      setNewDuration(service.durationMinutes ? service.durationMinutes.toString() : "30");
    }
  };

  const handleAddService = () => {
    if (!barber || !selectedServiceId) return;
    
    const price = parseFloat(newPrice);
    const durationMinutes = parseInt(newDuration, 10);
    
    if (isNaN(price) || price < 0 || isNaN(durationMinutes) || durationMinutes <= 0) {
      setError("Preço e duração devem ser válidos.");
      return;
    }

    startTransition(async () => {
      setError(null);
      const res = await allocateServiceAction({
        barberId: barber.id,
        serviceId: selectedServiceId,
        price,
        durationMinutes
      });

      if (res.success) {
        setIsAdding(false);
        setSelectedServiceId("");
        fetchData(); // reload lists
      } else {
        setError(res.error || "Erro ao alocar serviço.");
      }
    });
  };

  const handleStartEdit = (item: any) => {
    setEditingId(item.id);
    setEditPrice(Number(item.price).toFixed(2));
    setEditDuration(item.durationMinutes.toString());
  };

  const handleSaveEdit = (id: string) => {
    const price = parseFloat(editPrice);
    const durationMinutes = parseInt(editDuration, 10);
    
    if (isNaN(price) || price < 0 || isNaN(durationMinutes) || durationMinutes <= 0) {
      setError("Preço e duração devem ser válidos.");
      return;
    }

    startTransition(async () => {
      setError(null);
      const res = await updateAllocatedServiceAction({
        id,
        price,
        durationMinutes
      });

      if (res.success) {
        setEditingId(null);
        fetchData();
      } else {
        setError(res.error || "Erro ao atualizar serviço.");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Deseja remover este serviço do barbeiro?")) return;

    startTransition(async () => {
      setError(null);
      const res = await removeAllocatedServiceAction(id);
      if (res.success) {
        fetchData();
      } else {
        setError(res.error || "Erro ao remover serviço.");
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div 
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber/10 text-amber">
              <Scissors className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">Serviços do Barbeiro</h2>
              <p className="text-xs font-medium text-slate-500">{barber?.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            disabled={isPending}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-600 font-medium">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-3">
              <div className="h-8 w-8 rounded-full border-4 border-amber/30 border-t-amber animate-spin"></div>
              <p className="text-sm font-medium text-slate-500">Carregando serviços...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Allocated Services List */}
              {allocatedServices.length === 0 ? (
                <div className="text-center py-8 px-4 rounded-xl border border-dashed border-slate-300 bg-slate-50">
                  <p className="text-sm font-medium text-slate-600">Nenhum serviço alocado</p>
                  <p className="text-xs text-slate-400 mt-1">Este barbeiro ainda não realiza nenhum serviço.</p>
                </div>
              ) : (
                allocatedServices.map((item) => (
                  <div key={item.id} className="group relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-amber/30 transition-colors">
                    {editingId === item.id ? (
                      /* Edit Mode */
                      <div className="space-y-3">
                        <p className="text-sm font-bold text-slate-800">{item.service.name}</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Preço (R$)</label>
                            <input 
                              type="number" step="0.01" 
                              className="w-full h-9 px-3 rounded-lg border border-slate-300 text-sm focus:border-amber focus:ring-1 focus:ring-amber outline-none transition-all"
                              value={editPrice} onChange={e => setEditPrice(e.target.value)} disabled={isPending}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Duração (Min)</label>
                            <input 
                              type="number" 
                              className="w-full h-9 px-3 rounded-lg border border-slate-300 text-sm focus:border-amber focus:ring-1 focus:ring-amber outline-none transition-all"
                              value={editDuration} onChange={e => setEditDuration(e.target.value)} disabled={isPending}
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button 
                            className="flex-1 h-9 rounded-lg bg-amber text-white font-semibold text-sm hover:bg-amber-dark transition-colors flex items-center justify-center disabled:opacity-50"
                            onClick={() => handleSaveEdit(item.id)} disabled={isPending}
                          >
                            Salvar
                          </button>
                          <button 
                            className="flex-1 h-9 rounded-lg bg-slate-100 text-slate-600 font-semibold text-sm hover:bg-slate-200 transition-colors flex items-center justify-center disabled:opacity-50"
                            onClick={() => setEditingId(null)} disabled={isPending}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* View Mode */
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-slate-800">{item.service.name}</h3>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                              <Clock className="h-3 w-3 text-slate-400" />
                              {item.durationMinutes} min
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-dark bg-amber/10 px-2 py-0.5 rounded-md">
                              <DollarSign className="h-3 w-3" />
                              {Number(item.price).toFixed(2).replace(".", ",")}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            className="p-1.5 text-slate-400 hover:text-amber hover:bg-amber/10 rounded-md transition-colors"
                            onClick={() => handleStartEdit(item)} disabled={isPending} title="Editar"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button 
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                            onClick={() => handleDelete(item.id)} disabled={isPending} title="Remover"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}

              {/* Add New Service Form/Button */}
              {!isAdding ? (
                <button
                  onClick={() => setIsAdding(true)}
                  disabled={availableServices.length === 0 || isPending}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-slate-300 text-sm font-semibold text-slate-500 hover:border-amber hover:text-amber hover:bg-amber/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4" />
                  {availableServices.length === 0 
                    ? "Todos os serviços já foram alocados" 
                    : "Adicionar Serviço"
                  }
                </button>
              ) : (
                <div className="rounded-xl border border-amber bg-amber/5 p-4 shadow-sm space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Selecione o Serviço</label>
                    <select
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 text-sm focus:border-amber focus:ring-1 focus:ring-amber outline-none transition-all bg-white"
                      value={selectedServiceId}
                      onChange={(e) => handleSelectServiceToAdd(e.target.value)}
                      disabled={isPending}
                    >
                      <option value="">-- Escolha um serviço --</option>
                      {availableServices.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  {selectedServiceId && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Preço (R$)</label>
                        <input 
                          type="number" step="0.01" 
                          className="w-full h-9 px-3 rounded-lg border border-slate-300 text-sm focus:border-amber focus:ring-1 focus:ring-amber outline-none transition-all bg-white"
                          value={newPrice} onChange={e => setNewPrice(e.target.value)} disabled={isPending}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Duração (Min)</label>
                        <input 
                          type="number" 
                          className="w-full h-9 px-3 rounded-lg border border-slate-300 text-sm focus:border-amber focus:ring-1 focus:ring-amber outline-none transition-all bg-white"
                          value={newDuration} onChange={e => setNewDuration(e.target.value)} disabled={isPending}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button 
                      className="flex-1 h-9 rounded-lg bg-amber text-white font-semibold text-sm hover:bg-amber-dark transition-colors flex items-center justify-center disabled:opacity-50"
                      onClick={handleAddService} 
                      disabled={isPending || !selectedServiceId}
                    >
                      Salvar Serviço
                    </button>
                    <button 
                      className="flex-1 h-9 rounded-lg bg-white border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors flex items-center justify-center disabled:opacity-50"
                      onClick={() => { setIsAdding(false); setSelectedServiceId(""); }} 
                      disabled={isPending}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <button
            onClick={onClose}
            disabled={isPending}
            className="w-full h-11 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all flex items-center justify-center shadow-md disabled:opacity-50"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
