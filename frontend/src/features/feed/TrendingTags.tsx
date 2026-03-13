import React, { useEffect, useState } from 'react';
import { TrendingCategoria } from '../../shared/types/categoria.types';
import { getTrendingTags } from '../../shared/services/categoria.service';
import { TrendingUp } from 'lucide-react';

export default function TrendingTags() {
  const [tags, setTags] = useState<TrendingCategoria[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTrendingTags()
      .then(setTags)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-10 bg-[var(--input-bg)] rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-color)] shadow-[var(--shadow-elevation-1)]">
      <div className="flex items-center gap-4 mb-6">
  <TrendingUp 
    className="text-[var(--accent-primary)]" 
    size={24} 
    strokeWidth={2.5} 
  />
  <h2 className="font-bold text-lg text-[var(--text-primary)] tracking-tight">
    Tags em alta
  </h2>
</div>
      <div className="flex flex-col gap-3.5">
        {tags.map((tag, index) => (
          <div key={tag.categoria_id} className="group cursor-pointer">
            <div className="flex items-start gap-4">
              <span className="text-base font-black text-[var(--accent-primary)]/20 tabular-nums">
                {(index + 1).toString().padStart(2, '0')}
              </span>
              <div className="flex-1">
                <p className="text-sm font-bold text-[var(--text-secondary)] group-hover:text-[var(--accent-primary)] transition-colors">
                  #{tag.nome.toUpperCase()}
                </p>
                <p className="text-[10px] font-black text-[var(--text-primary)] mt-0.5">
                  {tag.contagem} {tag.contagem === 1 ? 'PERGAMINHO' : 'PERGAMINHOS'}
                </p>
              </div>
            </div>
          </div>
        ))}
        {tags.length === 0 && (
          <p className="text-sm text-[var(--text-secondary)] text-center italic">Nenhuma tendência ainda.</p>
        )}
      </div>
      
      <div className="mt-6 pt-4 border-t border-[var(--border-color)] text-center">
        <a href="#" className="text-x1 font-bold text-[var(--accent-primary)] hover:underline">
          Ver todas as tags
        </a>
      </div>
    </div>
  );
}
