'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2 } from 'lucide-react';
import { getApiErrorMessage } from '@/lib/api-errors';
import { getApiUrl } from '@/lib/api-client';

export default function DeleteNewsButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Deseja realmente excluir a notícia "${title}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(getApiUrl(`/api/admin/news/${id}`), {
        method: 'DELETE',
      });

      if (res.ok) {
        router.refresh();
      } else {
        const errorMsg = await getApiErrorMessage(res, 'Erro ao excluir a notícia.');
        alert(errorMsg);
      }
    } catch {
      alert('Falha na comunicação com o servidor.');
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
      title="Excluir notícia"
    >
      {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </button>
  );
}
