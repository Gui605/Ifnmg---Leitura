<!DOCTYPE html>

<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#17cf26",
                        "background-light": "#f6f8f6",
                        "background-dark": "#112112",
                    },
                    fontFamily: {
                        "display": ["Lexend"]
                    },
                    borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
                },
            },
        }
    </script>
<style>
        body { font-family: 'Lexend', sans-serif; }
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen">
<div class="layout-container flex h-full grow flex-col">
<!-- Top Navigation Bar -->
<header class="sticky top-0 z-50 flex items-center justify-between border-b border-primary/10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-6 md:px-20 py-3">
<div class="flex items-center gap-4">
<div class="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-white">
<span class="material-symbols-outlined text-3xl">menu_book</span>
</div>
<h2 class="text-xl font-bold leading-tight tracking-tight">IFNMG LEITURA</h2>
</div>
<div class="flex items-center gap-4 md:gap-8">
<a class="text-sm font-medium hover:text-primary transition-colors" href="#">Cancelar</a>
<div class="flex gap-3"><label class="flex items-center gap-2 cursor-pointer mr-2">
<input class="w-4 h-4 rounded border-primary/30 text-primary focus:ring-primary bg-transparent" type="checkbox"/>
<span class="text-xs font-medium text-slate-600 dark:text-slate-400">Publicar como Anônimo</span>
</label>
<button class="flex items-center justify-center rounded-lg h-10 px-6 bg-primary/10 text-primary border border-primary/20 text-sm font-bold hover:bg-primary/20 transition-all">
<span>Salvar Rascunho</span>
</button>
<button class="flex items-center justify-center rounded-lg h-10 px-6 bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:brightness-110 transition-all">
<span>Publicar Agora</span>
</button>
</div>
</div>
</header>
<main class="flex-1 max-w-[1200px] mx-auto w-full px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
<!-- Left Column: Editor -->
<div class="lg:col-span-2 space-y-6">
<div class="flex flex-col gap-2">
<h1 class="text-3xl font-bold tracking-tight">Criar Nova Publicação</h1>
<p class="text-slate-500 dark:text-slate-400">Compartilhe seu conhecimento, pesquisa ou dúvidas com seus colegas.</p>
</div>
<!-- Tabs -->
<div class="border-b border-primary/10">
<nav class="flex gap-8">
<a class="flex items-center gap-2 border-b-2 border-primary pb-3 px-1 text-primary font-semibold" href="#"><span class="material-symbols-outlined text-xl">article</span> Texto</a>
<a class="flex items-center gap-2 border-b-2 border-transparent pb-3 px-1 text-slate-500 hover:text-primary transition-colors" href="#"><span class="material-symbols-outlined text-xl">image</span> Imagem/Mídia</a>
<a class="flex items-center gap-2 border-b-2 border-transparent pb-3 px-1 text-slate-500 hover:text-primary transition-colors" href="#"><span class="material-symbols-outlined text-xl">link</span> Link</a>
</nav>
</div>
<!-- Input Fields -->
<div class="space-y-4">
<div class="flex flex-col gap-2">
<label class="text-sm font-semibold text-slate-700 dark:text-slate-300">Título</label>
<input class="w-full rounded-xl border-primary/20 bg-white dark:bg-slate-900 focus:ring-primary focus:border-primary p-4 text-lg font-medium outline-none transition-all" placeholder="Um título interessante para sua pesquisa, conto ou pensamento..." type="text"/>
</div>
<div class="flex flex-col gap-2">
<label class="text-sm font-semibold text-slate-700 dark:text-slate-300">Categoria ou Curso &amp; tags</label>
<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
<div class="relative">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">school</span>
<select class="w-full rounded-lg border-primary/20 bg-white dark:bg-slate-900 pl-10 pr-4 py-2 text-sm focus:ring-primary focus:border-primary outline-none appearance-none"><option>Selecionar Categoria ou Curso</option>
<option>Ciência da Computação</option>
<option>Engenharia Biomédica</option>
<option>Literatura &amp; Ficção</option>
<option>Poesia &amp; Crônicas</option>
<option>Artes &amp; Design</option>
<option>Direito e Ciências Sociais</option></select>
</div>
<div class="relative">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">label</span>
<input class="w-full rounded-lg border-primary/20 bg-white dark:bg-slate-900 pl-10 pr-4 py-2 text-sm focus:ring-primary focus:border-primary outline-none" placeholder="Adicione tags (ex: #poesia, #calculo, #ensaio)" type="text"/>
</div>
</div>
</div>
<!-- Rich Text Editor Container -->
<div class="flex flex-col rounded-xl border border-primary/20 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
<div class="flex flex-wrap items-center gap-1 border-b border-primary/10 bg-slate-50 dark:bg-slate-800/50 p-2">
<button class="p-2 hover:bg-primary/10 rounded transition-colors text-slate-600 dark:text-slate-300"><span class="material-symbols-outlined">format_bold</span></button>
<button class="p-2 hover:bg-primary/10 rounded transition-colors text-slate-600 dark:text-slate-300"><span class="material-symbols-outlined">format_italic</span></button>
<button class="p-2 hover:bg-primary/10 rounded transition-colors text-slate-600 dark:text-slate-300"><span class="material-symbols-outlined">format_underlined</span></button>
<div class="w-px h-6 bg-primary/10 mx-1"></div>
<button class="p-2 hover:bg-primary/10 rounded transition-colors text-slate-600 dark:text-slate-300"><span class="material-symbols-outlined">format_list_bulleted</span></button>
<button class="p-2 hover:bg-primary/10 rounded transition-colors text-slate-600 dark:text-slate-300"><span class="material-symbols-outlined">format_list_numbered</span></button>
<div class="w-px h-6 bg-primary/10 mx-1"></div>
<button class="p-2 hover:bg-primary/10 rounded transition-colors text-slate-600 dark:text-slate-300"><span class="material-symbols-outlined">code</span></button>
<button class="p-2 hover:bg-primary/10 rounded transition-colors text-slate-600 dark:text-slate-300"><span class="material-symbols-outlined">functions</span></button>
<button class="p-2 hover:bg-primary/10 rounded transition-colors text-slate-600 dark:text-slate-300"><span class="material-symbols-outlined">attachment</span></button>
</div>
<textarea class="w-full min-h-[300px] p-4 text-slate-700 dark:text-slate-200 bg-transparent border-none focus:ring-0 resize-none outline-none" placeholder="Escreva seu conteúdo aqui. Sinta-se livre para compartilhar pesquisas, histórias ou reflexões. Use markdown ou as ferramentas acima..."></textarea>
</div>
</div>
</div>
<!-- Right Column: Sidebar / Preview -->
<div class="space-y-6">
<!-- Preview Section -->
<div class="rounded-xl border border-primary/10 bg-white dark:bg-slate-900 shadow-xl p-6">
<div class="flex items-center justify-between mb-4">
<h3 class="font-bold flex items-center gap-2"><span class="material-symbols-outlined text-primary">visibility</span> Prévia do Feed</h3>
<span class="text-[10px] uppercase font-bold text-primary px-2 py-0.5 rounded bg-primary/10 tracking-widest">Rascunho</span>
</div>
<div class="space-y-4 opacity-80 pointer-events-none">
<div class="flex items-center gap-2">
<div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
<span class="material-symbols-outlined text-sm text-primary">person</span>
</div>
<div>
<p class="text-xs font-bold">@meu_perfil</p>
<p class="text-[10px] text-slate-500">Postado por você • Agora mesmo</p>
</div>
</div>
<div class="space-y-2">
<div class="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded"></div>
<div class="h-3 w-full bg-slate-100 dark:bg-slate-800/50 rounded"></div>
<div class="h-3 w-5/6 bg-slate-100 dark:bg-slate-800/50 rounded"></div>
</div>
<div class="flex gap-2">
<span class="h-5 w-16 bg-primary/10 rounded-full"></span>
<span class="h-5 w-20 bg-slate-100 dark:bg-slate-800 rounded-full"></span>
</div>
<div class="flex items-center gap-4 pt-2 border-t border-primary/5">
<div class="flex items-center gap-1">
<span class="material-symbols-outlined text-sm">arrow_upward</span>
<span class="text-xs">0</span>
<span class="material-symbols-outlined text-sm">arrow_downward</span>
</div>
<div class="flex items-center gap-1">
<span class="material-symbols-outlined text-sm">chat_bubble</span>
<span class="text-xs">0</span>
</div>
</div>
</div>
</div>
<!-- Guidelines -->
<div class="rounded-xl bg-primary/5 border border-primary/20 p-6 space-y-4">
<h3 class="font-bold flex items-center gap-2 text-primary"><span class="material-symbols-outlined">info</span> Diretrizes de Postagem</h3>
<ul class="text-xs space-y-3 text-slate-600 dark:text-slate-400">
<li class="flex items-start gap-2"><span class="text-primary mt-0.5">1.</span> Mantenha os títulos descritivos e objetivos.</li>
<li class="flex items-start gap-2"><span class="text-primary mt-0.5">2.</span> Certifique-se de citar fontes confiáveis e evite o compartilhamento de notícias falsas (fake news).</li>
<li class="flex items-start gap-2"><span class="text-primary mt-0.5">3.</span> Marque seus posts corretamente para alcançar os estudantes certos.</li>
<li class="flex items-start gap-2"><span class="text-primary mt-0.5">4.</span> Mantenha um tom respeitoso e colaborativo.</li>
</ul>
</div>
<!-- Academic Community Card -->
</div>
</main>
</div>
</body></html>