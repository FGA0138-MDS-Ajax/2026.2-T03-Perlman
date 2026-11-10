import { Link } from "react-router-dom";
import {
    ArrowLeft,
    Dumbbell,
    Shield,
    Database,
    UserCheck,
    Lock,
    Trash2,
    Bell,
    Scale,
    Mail,
    FileText,
    Globe,
    HeartPulse,
    Clock,
    Cookie,
    AlertCircle,
    CheckCircle2,
    GraduationCap,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function PaginaTermosDeUso() {
    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            {/* Header */}
            <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md px-6 py-4">
                <div className="mx-auto flex max-w-4xl items-center justify-between">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Voltar para o início
                    </Link>
                    <ThemeToggle variant="outline" className="h-9 w-9" />
                </div>
            </header>

            {/* Conteúdo principal */}
            <main className="flex-1 px-4 py-10 sm:px-6">
                <article className="mx-auto max-w-4xl space-y-10">
                    {/* Cabeçalho */}
                    <div className="text-center space-y-4">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
                            <Shield className="h-7 w-7" />
                        </div>
                        <h1 className="text-3xl font-heading font-extrabold tracking-tight sm:text-4xl text-balance">
                            Termos de Uso e Política de Privacidade
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            MotivaFit — Última revisão: 09 de novembro de 2026
                        </p>
                    </div>

                    {/* Destaque Institucional: Projeto Acadêmico */}
                    <section className="rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-3">
                        <div className="flex items-center gap-2.5 text-primary">
                            <GraduationCap className="h-5 w-5 shrink-0" />
                            <h2 className="text-base font-semibold">Natureza do Projeto Acadêmico (Sem Fins Comerciais)</h2>
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
                            O <strong className="text-foreground">MotivaFit</strong> é um projeto de software desenvolvido para fins
                            estritamente acadêmicos e pedagógicos pelo <strong className="text-foreground">Grupo Perlman</strong>, no âmbito da
                            disciplina de <strong className="text-foreground">Métodos de Desenvolvimento de Software (MDS)</strong> da
                            Universidade de Brasília (UnB). A plataforma não possui qualquer finalidade comercial ou lucrativa.
                            Os dados cadastrados são utilizados exclusivamente no contexto pedagógico da disciplina e jamais
                            serão comercializados, compartilhados com anunciantes ou explorados economicamente fora deste escopo.
                        </p>
                    </section>

                    {/* ============================================================== */}
                    {/* PARTE I: TERMOS DE USO DO SERVIÇO                              */}
                    {/* ============================================================== */}
                    <div className="pt-4 border-t">
                        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-primary mb-2">
                            <FileText className="h-4 w-4" />
                            Parte I
                        </div>
                        <h2 className="text-2xl font-heading font-bold tracking-tight">
                            Termos de Uso do Serviço
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Regras e diretrizes para utilização das funcionalidades do aplicativo MotivaFit.
                        </p>
                    </div>

                    {/* 1. Objeto e Natureza da Plataforma */}
                    <section className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Dumbbell className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-heading font-bold">1. Objeto e Escopo da Plataforma</h3>
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            O MotivaFit disponibiliza aos alunos e instrutores ferramentas para planejamento,
                            montagem, visualização de fichas de treino e acompanhamento individual da rotina de exercícios físicos.
                            O aplicativo opera como ferramenta de apoio à organização esportiva do próprio usuário.
                        </p>
                        <div className="rounded-lg bg-muted/50 border p-4 text-xs text-muted-foreground flex items-start gap-2.5">
                            <AlertCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <span>
                                <strong className="text-foreground">Aviso importante:</strong> O aplicativo não substitui
                                avaliação médica prévia, liberação clínica para prática desportiva nem prescrição presencial
                                de profissional de Educação Física habilitado junto ao CREF.
                            </span>
                        </div>
                    </section>

                    {/* 2. Requisitos de Acesso e Menores de Idade */}
                    <section className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Scale className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-heading font-bold">2. Elegibilidade e Uso por Menores de Idade</h3>
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            O cadastro e utilização da plataforma são recomendados a pessoas com idade igual ou superior a
                            <strong className="text-foreground"> 18 anos</strong>.
                        </p>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Em observância ao <strong className="text-foreground">art. 14 da LGPD</strong> (Tratamento de dados pessoais de crianças e adolescentes),
                            adolescentes entre 16 e 18 anos incompletos somente poderão se cadastrar e utilizar o MotivaFit mediante a prévia ciência,
                            autorização e assistência expressa de ao menos um dos pais ou responsável legal, cabendo a estes zelar pela adequação
                            das atividades físicas selecionadas.
                        </p>
                    </section>

                    {/* 3. Responsabilidades do Usuário */}
                    <section className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <UserCheck className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-heading font-bold">3. Responsabilidades do Usuário</h3>
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Ao acessar e interagir com o MotivaFit, o usuário compromete-se a:
                        </p>
                        <ul className="space-y-2.5 text-sm text-muted-foreground ml-2">
                            <li className="flex items-start gap-2.5">
                                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                <span>Fornecer dados cadastrais legítimos, exatos e atualizados.</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                <span>
                                    Preservar o sigilo e a inviolabilidade da sua senha pessoal, não a compartilhando com terceiros.
                                </span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                <span>
                                    Não praticar engenharia reversa, inserção de código malicioso ou tentativa de sobrecarregar a infraestrutura do sistema.
                                </span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                <span>
                                    Notificar prontamente os administradores caso identifique qualquer indício de acesso não autorizado à sua conta.
                                </span>
                            </li>
                        </ul>
                    </section>

                    {/* 4. Alterações nos Termos */}
                    <section className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Bell className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-heading font-bold">4. Alterações nestes Termos</h3>
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Estes Termos e a Política de Privacidade poderão sofrer atualizações e melhorias contínuas.
                            Em caso de alterações relevantes (que impactem as finalidades do tratamento, os direitos dos titulares
                            ou o escopo das funcionalidades), os usuários serão informados previamente por meio de aviso em destaque na
                            plataforma ou por e-mail com antecedência razoável.
                        </p>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            A continuidade no uso do aplicativo após a publicação das alterações indicará a concordância do usuário com a versão revisada.
                        </p>
                    </section>

                    {/* ============================================================== */}
                    {/* PARTE II: POLÍTICA DE PRIVACIDADE E PROTEÇÃO DE DADOS (LGPD)  */}
                    {/* ============================================================== */}
                    <div className="pt-8 border-t">
                        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-primary mb-2">
                            <Shield className="h-4 w-4" />
                            Parte II
                        </div>
                        <h2 className="text-2xl font-heading font-bold tracking-tight">
                            Política de Privacidade e Proteção de Dados (LGPD)
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Tratamento de dados pessoais em conformidade integral com a Lei Federal nº 13.709/2018 (LGPD).
                        </p>
                    </div>

                    {/* 5. Bases Legais do Tratamento */}
                    <section className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Scale className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-heading font-bold">5. Bases Legais para o Tratamento de Dados</h3>
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Todo o tratamento de dados pessoais realizado pelo MotivaFit está devidamente amparado nas seguintes
                            hipóteses da LGPD:
                        </p>
                        <ul className="space-y-2 text-sm text-muted-foreground ml-2">
                            <li className="flex items-start gap-2.5">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                <span>
                                    <strong className="text-foreground">Consentimento do titular (art. 7º, I, e art. 14):</strong> manifestado
                                    no momento do cadastro voluntário na aplicação e aceite destes termos.
                                </span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                <span>
                                    <strong className="text-foreground">Execução de contrato e procedimentos preliminares (art. 7º, V):</strong> necessário
                                    para viabilizar a entrega dos serviços solicitados pelo usuário (autenticação, registro e consulta de treinos).
                                </span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                <span>
                                    <strong className="text-foreground">Cumprimento de obrigação legal ou regulatória (art. 7º, II):</strong> como
                                    a guarda temporária de registros de conexão prevista no Marco Civil da Internet (Lei nº 12.965/2014).
                                </span>
                            </li>
                        </ul>
                    </section>

                    {/* 6. Dados Coletados */}
                    <section className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Database className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-heading font-bold">6. Dados Pessoais Coletados</h3>
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Para o funcionamento do serviço, são coletadas as seguintes categorias de informações:
                        </p>
                        <ul className="space-y-2 text-sm text-muted-foreground ml-2">
                            <li className="flex items-start gap-2.5">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                <span>
                                    <strong className="text-foreground">Dados cadastrais e de autenticação:</strong> endereço de e-mail e senha
                                    (armazenada obrigatoriamente com hash criptográfico irreversível).
                                </span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                <span>
                                    <strong className="text-foreground">Dados de treinos e execução física:</strong> nome das rotinas de treino,
                                    exercícios associados do catálogo, carga (kg), séries, repetições, tempo (s) e distância (m) informados pelo usuário.
                                </span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                <span>
                                    <strong className="text-foreground">Dados técnicos de sessão:</strong> registros de horário de requisições, endereço IP e identificadores
                                    técnicos da sessão do navegador.
                                </span>
                            </li>
                        </ul>
                    </section>

                    {/* 7. Esclarecimento sobre Dados de Saúde */}
                    <section className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <HeartPulse className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-heading font-bold">7. Esclarecimento sobre Dados Sensíveis de Saúde</h3>
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            O MotivaFit <strong className="text-foreground">NÃO coleta dados sensíveis de saúde</strong> nos termos do
                            art. 5º, II, da LGPD.
                        </p>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            A plataforma <strong className="text-foreground">não</strong> solicita nem armazena exames médicos, histórico clínico,
                            laudos de aptidão física, dados antropométricos intrusivos, peso corporal, altura, percentual de gordura ou prontuários.
                            As anotações registradas dizem respeito unicamente a parâmetros mecânicos de treino esportivo (séries, repetições e cargas)
                            preenchidos espontaneamente para acompanhamento pessoal da evolução de exercícios.
                        </p>
                    </section>

                    {/* 8. Finalidade do Uso dos Dados */}
                    <section className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <UserCheck className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-heading font-bold">8. Finalidade do Uso dos Dados</h3>
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            As informações coletadas são utilizadas para as seguintes finalidades:
                        </p>
                        <ul className="space-y-2 text-sm text-muted-foreground ml-2">
                            <li className="flex items-start gap-2.5">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                <span>Criar, identificar e manter a conta do usuário de forma segura.</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                <span>Permitir a montagem, edição, replicação e registro de treinos personalizados.</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                <span>Gerar métricas de histórico de frequência e evolução de carga para o próprio usuário e para instrutores credenciados.</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                <span>Aprimorar a estabilidade, usabilidade e segurança técnica da plataforma.</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                <span>Cumprir ordens judiciais ou obrigações regulatórias cabíveis.</span>
                            </li>
                        </ul>
                    </section>

                    {/* 9. Cookies e Armazenamento Local */}
                    <section className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Cookie className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-heading font-bold">9. Cookies e Armazenamento Local (localStorage)</h3>
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            O MotivaFit utiliza mecanismos de armazenamento local no navegador (<code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">localStorage</code>)
                            e cookies de sessão estritamente essenciais para:
                        </p>
                        <ul className="space-y-1.5 text-sm text-muted-foreground ml-2">
                            <li className="flex items-start gap-2.5">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                <span>Manter o estado da sessão de autenticação ativa e segura durante a navegação.</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                <span>Memorizar a preferência visual de tema (modo claro ou modo escuro).</span>
                            </li>
                        </ul>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Não empregamos cookies de publicidade direcionada, parceiros comerciais nem rastreadores de terceiros para monitoramento de navegação externa.
                        </p>
                    </section>

                    {/* 10. Compartilhamento e Operadores */}
                    <section className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Shield className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-heading font-bold">10. Compartilhamento com Operadores de Infraestrutura</h3>
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Os dados pessoais não são comercializados nem compartilhados com terceiros para fins de marketing. O acesso
                            ocorre estritamente com:
                        </p>
                        <ul className="space-y-2 text-sm text-muted-foreground ml-2">
                            <li className="flex items-start gap-2.5">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                <span>
                                    <strong className="text-foreground">Operadores de infraestrutura e computação em nuvem</strong> (tais como serviços de banco de dados,
                                    hospedagem ou autenticação Firebase/Google Cloud), contratados sob rígidos padrões contratuais de confidencialidade e segurança da informação.
                                </span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                <span>
                                    <strong className="text-foreground">Instrutores e administradores vinculados à conta do aluno</strong>, estritamente
                                    para a correta montagem e acompanhamento das rotinas desportivas.
                                </span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                <span>
                                    <strong className="text-foreground">Autoridades públicas</strong>, única e exclusivamente mediante requisição legal ou determinação judicial formal.
                                </span>
                            </li>
                        </ul>
                    </section>

                    {/* 11. Transferência Internacional de Dados */}
                    <section className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Globe className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-heading font-bold">11. Armazenamento e Transferência Internacional de Dados</h3>
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Em virtude do uso de operadores de infraestrutura em nuvem globais,
                            alguns dados podem ser armazenados em servidores localizados fora do território nacional, em estrita conformidade com o
                            <strong className="text-foreground"> art. 33 da LGPD</strong>.
                        </p>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Tais provedores adotam cláusulas contratuais e certificações internacionais de proteção de dados que asseguram nível
                            de proteção adequado e compatível com as exigências da legislação brasileira.
                        </p>
                    </section>

                    {/* 12. Prazo de Retenção */}
                    <section className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Clock className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-heading font-bold">12. Prazo de Retenção e Descarte</h3>
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Os dados pessoais são mantidos enquanto a conta do usuário permanecer ativa na plataforma.
                        </p>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Após a solicitação formal de exclusão da conta ou encerramento das atividades do projeto, os dados pessoais
                            serão definitivamente excluídos ou anonimizados em até <strong className="text-foreground">30 (trinta) dias</strong>,
                            salvo nas hipóteses em que a sua guarda for expressamente exigida por lei ou autorizada pelas hipóteses do art. 16 da LGPD
                            (como para cumprimento de prazo legal de registros de conexão ou defesa em processo administrativo/judicial).
                        </p>
                    </section>

                    {/* 13. Segurança e Incidentes */}
                    <section className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Lock className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-heading font-bold">13. Segurança da Informação e Resposta a Incidentes</h3>
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Implementamos medidas de segurança técnicas e organizacionais proporcionais, incluindo canais criptografados (HTTPS/TLS),
                            hashing de senhas, controles de privilégios de acesso e sanitização de requisições.
                        </p>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Em consonância com o <strong className="text-foreground">art. 48 da LGPD</strong>, caso ocorra qualquer incidente de segurança
                            que possa acarretar risco ou dano relevante aos direitos e liberdades individuais dos usuários, nossa equipe comunicará
                            o fato em prazo razoável tanto aos <strong className="text-foreground">titulares afetados</strong> quanto à
                            <strong className="text-foreground"> Autoridade Nacional de Proteção de Dados (ANPD)</strong>, descrevendo a natureza dos dados,
                            as medidas técnicas de proteção empregadas e as ações de mitigação tomadas.
                        </p>
                    </section>

                    {/* 14. Direitos do Titular */}
                    <section className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Trash2 className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-heading font-bold">14. Direitos do Titular e Prazo de Atendimento</h3>
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            O usuário titular de dados pessoais pode exercer gratuitamente, a qualquer momento, mediante solicitação formal,
                            os direitos assegurados pelo <strong className="text-foreground">art. 18 da LGPD</strong>:
                        </p>
                        <ul className="space-y-2 text-sm text-muted-foreground ml-2">
                            <li className="flex items-start gap-2.5">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                <span><strong className="text-foreground">Confirmação e Acesso:</strong> confirmar a existência de tratamento e consultar os dados cadastrados.</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                <span><strong className="text-foreground">Correção:</strong> retificar dados incompletos, inexatos ou desatualizados.</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                <span><strong className="text-foreground">Anonimização, bloqueio ou eliminação:</strong> requerer o descarte de dados desnecessários ou excessivos.</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                <span><strong className="text-foreground">Portabilidade:</strong> solicitar o envio dos dados em formato estruturado.</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                <span><strong className="text-foreground">Revogação do consentimento:</strong> revogar a autorização de tratamento concedida anteriormente.</span>
                            </li>
                        </ul>
                        <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 text-xs text-muted-foreground flex items-start gap-2.5">
                            <Clock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <span>
                                <strong className="text-foreground">Prazo legal de resposta (art. 19, II, da LGPD):</strong> As solicitações
                                de titulares serão analisadas e respondidas no prazo regulamentar de até <strong className="text-foreground">15 (quinze) dias</strong> a
                                contar da data do requerimento.
                            </span>
                        </div>
                    </section>

                    {/* 15. Controlador e Canal de Contato */}
                    <section className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Mail className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-heading font-bold">15. Identificação do Controlador e Canal de Contato (DPO)</h3>
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Para exercer seus direitos de privacidade, tirar dúvidas ou apresentar sugestões sobre o tratamento de dados pessoais,
                            o titular pode entrar em contato com o Encarregado pelo Tratamento de Dados (DPO) e a equipe responsável:
                        </p>
                        <div className="rounded-lg bg-muted/50 border p-5 text-sm text-muted-foreground space-y-2">
                            <p><strong className="text-foreground">Controlador:</strong> Projeto MotivaFit — Grupo Perlman</p>
                            <p><strong className="text-foreground">Vínculo institucional:</strong> Universidade de Brasília (UnB) · Métodos de Desenvolvimento de Software (MDS)</p>
                            <p><strong className="text-foreground">Encarregado / Canal Oficial de Privacidade (LGPD):</strong> Equipe de Proteção de Dados MotivaFit</p>
                            <p>
                                <strong className="text-foreground">Canal de Atendimento por E-mail:</strong>{" "}
                                <a
                                    href="mailto:251026248@aluno.unb.br"
                                    className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
                                >
                                    251026248@aluno.unb.br
                                </a>{" "}
                                /{" "}
                                <a
                                    href="mailto:grupoperlman.mds@gmail.com"
                                    className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
                                >
                                    grupoperlman.mds@gmail.com
                                </a>
                            </p>
                        </div>
                    </section>

                    {/* Ações / Aviso Final */}
                    <div className="text-center py-6 space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Ao criar sua conta no MotivaFit, você confirma estar ciente e de acordo com as disposições destes Termos de Uso e da Política de Privacidade.
                        </p>
                        <div className="flex justify-center gap-3">
                            <Link
                                to="/cadastro"
                                className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
                            >
                                Criar minha conta
                            </Link>
                            <Link
                                to="/"
                                className="inline-flex items-center gap-2 rounded-md border px-6 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
                            >
                                Voltar ao início
                            </Link>
                        </div>
                    </div>
                </article>
            </main>

            {/* Footer */}
            <footer className="border-t px-6 py-6 text-center text-sm text-muted-foreground bg-muted/20">
                <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span>© 2026 MotivaFit — Grupo Perlman & UnB. Todos os direitos reservados.</span>
                    <div className="flex items-center gap-4 text-xs">
                        <Link to="/termos-de-uso" className="hover:text-foreground">Termos de Uso</Link>
                        <Link to="/login" className="hover:text-foreground">Login</Link>
                        <Link to="/cadastro" className="hover:text-foreground">Cadastro</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
