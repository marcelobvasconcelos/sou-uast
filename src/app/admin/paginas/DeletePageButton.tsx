'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2 } from 'lucide-react';

export default function DeletePageButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Deseja realmente excluir a página "${title}" e todos os seus blocos?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/pages/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Erro ao excluir página.');
      }
    } catch {
      alert('Falha na comunicação.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-1.5 text-red-500 hover:text-red-700 rounded hover:bg-red-50 transition disabled:opacity-50"
      title="Excluir página"
    >
      {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </button>
  );
}
