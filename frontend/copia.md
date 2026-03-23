<!DOCTYPE html>

<html lang="pt-br"><head>
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
<div class="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
<div class="layout-container flex h-full grow flex-col">
<!-- Top Navigation Bar -->
<header class="flex items-center justify-between whitespace-nowrap border-b border-solid border-primary/10 bg-background-light dark:bg-background-dark px-6 md:px-10 py-3 sticky top-0 z-50">
<div class="flex items-center gap-8">
<div class="flex items-center gap-3 text-primary">
<span class="material-symbols-outlined text-3xl">menu_book</span>
<h2 class="text-slate-900 dark:text-slate-100 text-xl font-bold leading-tight tracking-tight">IFNMG LEITURA</h2>
</div>
<div class="hidden md:flex items-center gap-6">
<a class="text-slate-700 dark:text-slate-300 text-sm font-medium hover:text-primary transition-colors" href="#">Feed</a>
<a class="text-slate-700 dark:text-slate-300 text-sm font-medium hover:text-primary transition-colors" href="#">Biblioteca</a>
<a class="text-primary text-sm font-bold border-b-2 border-primary pb-1" href="#">Pesquisa</a>
<a class="text-slate-700 dark:text-slate-300 text-sm font-medium hover:text-primary transition-colors" href="#">Perfil</a>
</div>
</div>
<div class="flex flex-1 justify-end gap-4">                    
                    </div>
<div class="bg-primary/10 rounded-full p-1 border border-primary/20">
    <img alt="Academic user profile photo" 
         class="size-8 rounded-full" 
         src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=b6e3f4" 
    />
</div>
</div>
</header>
<main class="flex flex-1 flex-col md:flex-row max-w-[1440px] mx-auto w-full px-4 md:px-10 py-8 gap-8">
<!-- Sidebar Filters (AO3 Inspired) -->
<aside class="w-full md:w-80 flex flex-col gap-6 order-2 md:order-1">
<div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-primary/10 shadow-sm">
<div class="flex items-center justify-between mb-4">
<h3 class="text-lg font-bold flex items-center gap-2">
<span class="material-symbols-outlined text-primary">filter_list</span>
                                Filtros Avançados
                            </h3>
<button class="text-xs text-primary font-bold hover:underline">Limpar Tudo</button>
</div>
<!-- Filter Sections -->
<div class="space-y-6">
<!-- Course Filter -->
<div>
<label class="text-sm font-semibold mb-2 block text-slate-500 uppercase tracking-wider">Curso</label>
<select class="w-full rounded-lg bg-background-light dark:bg-slate-800 border-primary/20 focus:ring-primary focus:border-primary text-sm">
<option>Todos os cursos</option>
<option>Informática</option>
<option>Engenharia Florestal</option>
<option>Medicina</option>
<option>Direito</option>
</select>
</div>
<!-- Language Filter -->
<div>
<label class="text-sm font-semibold mb-2 block text-slate-500 uppercase tracking-wider">Idioma</label>
<div class="space-y-2">
<label class="flex items-center gap-2 text-sm">
<input checked="" class="rounded text-primary focus:ring-primary bg-background-light dark:bg-slate-800 border-primary/20" type="checkbox"/> Português
                                    </label>
<label class="flex items-center gap-2 text-sm">
<input class="rounded text-primary focus:ring-primary bg-background-light dark:bg-slate-800 border-primary/20" type="checkbox"/> Inglês
                                    </label>
<label class="flex items-center gap-2 text-sm">
<input class="rounded text-primary focus:ring-primary bg-background-light dark:bg-slate-800 border-primary/20" type="checkbox"/> Espanhol
                                    </label>
</div>
</div>
<!-- Status Filter -->
<div>
<label class="text-sm font-semibold mb-2 block text-slate-500 uppercase tracking-wider">Status</label>
<div class="grid grid-cols-2 gap-2">
<button class="bg-primary text-white text-xs font-bold py-2 px-3 rounded-lg">Concluído</button>
<button class="bg-primary/10 text-primary text-xs font-bold py-2 px-3 rounded-lg hover:bg-primary/20">Em Andamento</button>
</div>
</div>
<!-- Tags Filter (Text Input style) -->
<div>
<label class="text-sm font-semibold mb-2 block text-slate-500 uppercase tracking-wider">Outras Tags</label>
<div class="relative">
<input class="w-full text-sm rounded-lg bg-background-light dark:bg-slate-800 border-primary/20 focus:ring-primary focus:border-primary pl-9" placeholder="IA, Machine Learning, Sustentabilidade..." type="text"/>
<span class="material-symbols-outlined absolute left-2 top-2 text-primary/60">sell</span>
</div>
</div>
<button class="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md">
<span class="material-symbols-outlined">search</span>
                                Filtrar Resultados
                            </button>
</div>
</div>
<!-- Helpful Links Sidebar AO3 Style -->
<div class="bg-primary/5 dark:bg-primary/10 p-4 rounded-xl border border-primary/20">
<h4 class="text-xs font-bold text-primary mb-2">AJUDA</h4>
<ul class="text-xs space-y-2 text-slate-600 dark:text-slate-400">
<li><a class="hover:text-primary underline decoration-primary/30" href="#">Como funcionam as citações?</a></li>
<li><a class="hover:text-primary underline decoration-primary/30" href="#">Termos de Serviço Acadêmico</a></li>
</ul>
</div>
</aside>
<!-- Search Content -->
<section class="flex-1 order-1 md:order-2">
<!-- Top Search Bar Container -->
<div class="mb-8">
<h1 class="text-3xl font-bold mb-6">Explorar Trabalhos</h1>
<div class="relative group">
<input class="w-full h-14 bg-white dark:bg-slate-900 border-2 border-primary/20 rounded-xl px-12 focus:ring-primary focus:border-primary text-lg shadow-sm" placeholder="Pesquisar por título, autor ou palavras-chave..." type="text"/>
<span class="material-symbols-outlined absolute left-4 top-4 text-primary text-2xl">search</span>
<div class="absolute right-4 top-3 flex gap-2">
<kbd class="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700 text-xs text-slate-500">Ctrl</kbd>
<kbd class="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700 text-xs text-slate-500">K</kbd>
</div>
</div>
<div class="mt-4 flex flex-wrap gap-2 items-center">
<span class="text-xs font-bold text-slate-500 uppercase mr-2">Buscas Populares:</span>
<span class="bg-white dark:bg-slate-800 px-3 py-1 rounded-full text-xs font-medium border border-primary/20 cursor-pointer hover:bg-primary/10 transition-colors">#DeepLearning</span>
<span class="bg-white dark:bg-slate-800 px-3 py-1 rounded-full text-xs font-medium border border-primary/20 cursor-pointer hover:bg-primary/10 transition-colors">#IoT</span>
<span class="bg-white dark:bg-slate-800 px-3 py-1 rounded-full text-xs font-medium border border-primary/20 cursor-pointer hover:bg-primary/10 transition-colors">#Reflorestamento</span>
</div>
</div>
<div class="flex items-center justify-between mb-4 border-b border-primary/10 pb-2">
<span class="text-sm text-slate-500 font-medium">1.245 resultados encontrados</span>
<div class="flex items-center gap-2">
<span class="text-sm text-slate-500">Ordenar por:</span>
<select class="bg-transparent border-none text-sm font-bold text-primary focus:ring-0 cursor-pointer p-0">
<option>Mais Recentes</option>
<option>Mais Citados</option>
<option>Maior Engajamento</option>
</select>
</div>
</div>
<!-- Work Cards List -->
<div class="space-y-4">
<!-- Result Card 1 -->
<div class="bg-white dark:bg-slate-900 border border-primary/10 rounded-xl p-6 shadow-sm hover:border-primary/40 transition-all group">
<div class="flex flex-col md:flex-row justify-between gap-4">
<div class="flex-1">
<div class="flex items-center gap-2 mb-2">
<span class="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Informática</span>
<span class="text-slate-400 text-xs italic">Publicado em 12 Out 2023</span>
</div>
<h3 class="text-xl font-bold group-hover:text-primary transition-colors cursor-pointer mb-1">Impacto da Inteligência Artificial na Triagem de Dados Hospitalares</h3>
<p class="text-sm font-medium text-primary mb-3">por <span class="hover:underline cursor-pointer">Dr. Ricardo Nunes</span>, <span class="hover:underline cursor-pointer">Beatriz Silva</span></p>
<div class="flex flex-wrap gap-2 mb-4">
<span class="text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400">#MachineLearning</span>
<span class="text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400">#SaúdeDigital</span>
<span class="text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400">#Python</span>
</div>
<p class="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                        Este artigo explora como algoritmos de aprendizado supervisionado podem otimizar o tempo de espera em emergências públicas, reduzindo a sobrecarga administrativa através de...
                                    </p>
</div>
<div class="flex md:flex-col justify-between items-end gap-2 shrink-0">
<div class="flex items-center gap-1 text-primary">
<span class="material-symbols-outlined text-sm font-bold">check_circle</span>
<span class="text-xs font-bold uppercase">Concluído</span>
</div>
<div class="flex gap-4 md:gap-0 md:flex-col md:items-end">
<div class="flex items-center gap-1 text-slate-500">
<span class="text-xs font-bold">1.2k</span>
<span class="material-symbols-outlined text-lg">visibility</span>
</div>
<div class="flex items-center gap-1 text-slate-500">
<span class="text-xs font-bold">342</span>
<span class="material-symbols-outlined text-lg text-primary">thumb_up</span>
</div>
<div class="flex items-center gap-1 text-slate-500">
<span class="text-xs font-bold">58</span>
<span class="material-symbols-outlined text-lg">format_quote</span>
</div>
</div>
</div>
</div>
</div>
<!-- Result Card 2 -->
<div class="bg-white dark:bg-slate-900 border border-primary/10 rounded-xl p-6 shadow-sm hover:border-primary/40 transition-all group">
<div class="flex flex-col md:flex-row justify-between gap-4">
<div class="flex-1">
<div class="flex items-center gap-2 mb-2">
<span class="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Eng. Florestal</span>
<span class="text-slate-400 text-xs italic">Atualizado em 02 Jan 2026</span>
</div>
<h3 class="text-xl font-bold group-hover:text-primary transition-colors cursor-pointer mb-1">Análise Foliar e Manejo de Pragas em Pinos no Sudeste Brasileiro</h3>
<p class="text-sm font-medium text-primary mb-3">por <span class="hover:underline cursor-pointer">Ana Claudia Marinho</span></p>
<div class="flex flex-wrap gap-2 mb-4">
<span class="text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400">#Silvicultura</span>
<span class="text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400">#BiomaMataAtlantica</span>
</div>
<p class="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                        Monitoramento contínuo de nutrientes em áreas experimentais de cultivo intensivo. O trabalho apresenta dados preliminares coletados ao longo de 24 meses de...
                                    </p>
</div>
<div class="flex md:flex-col justify-between items-end gap-2 shrink-0">
<div class="flex items-center gap-1 text-amber-500">
<span class="material-symbols-outlined text-sm font-bold">pending</span>
<span class="text-xs font-bold uppercase">Em Andamento</span>
</div>
<div class="flex gap-4 md:gap-0 md:flex-col md:items-end">
<div class="flex items-center gap-1 text-slate-500">
<span class="text-xs font-bold">890</span>
<span class="material-symbols-outlined text-lg">visibility</span>
</div>
<div class="flex items-center gap-1 text-slate-500">
<span class="text-xs font-bold">120</span>
<span class="material-symbols-outlined text-lg text-primary">thumb_up</span>
</div>
<div class="flex items-center gap-1 text-slate-500">
<span class="text-xs font-bold">12</span>
<span class="material-symbols-outlined text-lg">format_quote</span>
</div>
</div>
</div>
</div>
</div>
<!-- Result Card 3 -->
<div class="bg-white dark:bg-slate-900 border border-primary/10 rounded-xl p-6 shadow-sm hover:border-primary/40 transition-all group">
<div class="flex flex-col md:flex-row justify-between gap-4">
<div class="flex-1">
<div class="flex items-center gap-2 mb-2">
<span class="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Direito</span>
<span class="text-slate-400 text-xs italic">Publicado em 22 Fev 2026</span>
</div>
<h3 class="text-xl font-bold group-hover:text-primary transition-colors cursor-pointer mb-1">Ética e Legislação no Uso de Algoritmos Preditivos</h3>
<p class="text-sm font-medium text-primary mb-3">por <span class="hover:underline cursor-pointer">Luisa F. Guedes</span></p>
<div class="flex flex-wrap gap-2 mb-4">
<span class="text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400">#LegalTech</span>
<span class="text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400">#GDPR</span>
<span class="text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400">#IA</span>
</div>
<p class="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                        Um exame detalhado das lacunas normativas no Brasil frente ao avanço das ferramentas de automação jurídica e as implicações na garantia do devido processo legal...
                                    </p>
</div>
<div class="flex md:flex-col justify-between items-end gap-2 shrink-0">
<div class="flex items-center gap-1 text-primary">
<span class="material-symbols-outlined text-sm font-bold">check_circle</span>
<span class="text-xs font-bold uppercase">Concluído</span>
</div>
<div class="flex gap-4 md:gap-0 md:flex-col md:items-end">
<div class="flex items-center gap-1 text-slate-500">
<span class="text-xs font-bold">452</span>
<span class="material-symbols-outlined text-lg">visibility</span>
</div>
<div class="flex items-center gap-1 text-slate-500">
<span class="text-xs font-bold">89</span>
<span class="material-symbols-outlined text-lg text-primary">thumb_up</span>
</div>
<div class="flex items-center gap-1 text-slate-500">
<span class="text-xs font-bold">4</span>
<span class="material-symbols-outlined text-lg">format_quote</span>
</div>
</div>
</div>
</div>
</div>
</div>
<!-- Pagination AO3 Style -->
<div class="mt-10 flex items-center justify-center gap-4">
<button class="bg-primary/10 hover:bg-primary/20 p-2 rounded-lg transition-colors">
<span class="material-symbols-outlined text-primary">chevron_left</span>
</button>
<div class="flex gap-2">
<button class="w-10 h-10 rounded-lg bg-primary text-white font-bold">1</button>
<button class="w-10 h-10 rounded-lg hover:bg-primary/10 font-bold">2</button>
<button class="w-10 h-10 rounded-lg hover:bg-primary/10 font-bold">3</button>
<span class="flex items-end px-2 font-bold text-slate-400">...</span>
<button class="w-10 h-10 rounded-lg hover:bg-primary/10 font-bold">42</button>
</div>
<button class="bg-primary/10 hover:bg-primary/20 p-2 rounded-lg transition-colors">
<span class="material-symbols-outlined text-primary">chevron_right</span>
</button>
</div>
</section>
</main>
<!-- Footer Small -->
<footer class="mt-12 border-t border-primary/10 py-8 bg-white dark:bg-slate-900 px-6">
<div class="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-primary">terminal</span>
<span class="font-bold text-slate-900 dark:text-slate-100">IFNMG LEITURA</span>
<span>© 2026 - O seu repositório acadêmico.</span>
</div>
<div class="flex gap-6">
<a class="hover:text-primary transition-colors" href="#">Sobre</a>
<a class="hover:text-primary transition-colors" href="#">FAQ</a>
<a class="hover:text-primary transition-colors" href="#">Privacidade</a>
<a class="hover:text-primary transition-colors" href="#">Contato</a>
</div>
</div>
</footer>
</div>
</div>
</body></html>