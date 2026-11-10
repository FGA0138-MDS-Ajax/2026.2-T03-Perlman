import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider, RotaProtegida, RotaAdmin, RotaSuperusuario, RotaPublica } from "@/lib/auth-context";
import PaginaInterfaceInicial from "@/pages-user/pagina-interface-inicial";
import PaginaLogin from "@/pages-user/pagina-login";
import PaginaCadastro from "@/pages-user/pagina-cadastro";
import PaginaPrincipal from "@/pages-user/pagina-principal";
import PaginaDashboardAdmin from "@/pages-admin/pagina-dashboard-admin";
import PaginaTreinosAdmin from "@/pages-admin/pagina-treinos-admin";
import PaginaRelatoriosAdmin from "@/pages-admin/pagina-relatorios-admin";
import PaginaSuperUsuario from "@/pages-admin/pagina-superusuario";
import PaginaTreinos from "./pages-user/pagina-treinos";
import PaginaRealizarTreino from "./pages-user/pagina-realizar-treino";
import PaginaTermosDeUso from "@/pages-user/pagina-termos-de-uso";

function App() {
    return (
        <ThemeProvider defaultTheme="light" storageKey="motivafit-theme">
            <Router>
                <AuthProvider>
                    <Routes>
                        {/* Rota inicial */}
                        <Route path="/" element={<PaginaInterfaceInicial />} />

                        {/* Login e Cadastro (protegidos contra acesso se já logado) */}
                        <Route
                            path="/login"
                            element={
                                <RotaPublica>
                                    <PaginaLogin />
                                </RotaPublica>
                            }
                        />
                        <Route
                            path="/cadastro"
                            element={
                                <RotaPublica>
                                    <PaginaCadastro />
                                </RotaPublica>
                            }
                        />

                        {/* Painel do Aluno: Exige usuário logado */}
                        <Route
                            path="/principal"
                            element={
                                <RotaProtegida>
                                    <PaginaPrincipal />
                                </RotaProtegida>
                            }
                        />

                        {/* Painel do Aluno: Exige usuário logado */}
                        <Route
                            path="/treinos"
                            element={
                                <RotaProtegida>
                                    <PaginaTreinos />
                                </RotaProtegida>
                            }
                        />
                        <Route
                            path="/treinos/:treinoId/realizar"
                            element={
                                <RotaProtegida>
                                    <PaginaRealizarTreino />
                                </RotaProtegida>
                            }
                        />

                        {/* Páginas administrativas exigem sessão autenticada e perfil administrativo */}
                        <Route
                            path="/admin"
                            element={
                                <RotaAdmin>
                                    <PaginaDashboardAdmin />
                                </RotaAdmin>
                            }
                        />
                        <Route
                            path="/admin/treinos"
                            element={
                                <RotaAdmin>
                                    <PaginaTreinosAdmin />
                                </RotaAdmin>
                            }
                        />
                        <Route
                            path="/admin/relatorios"
                            element={
                                <RotaAdmin>
                                    <PaginaRelatoriosAdmin />
                                </RotaAdmin>
                            }
                        />
                        <Route
                            path="/admin/superusuario"
                            element={
                                <RotaSuperusuario>
                                    <PaginaSuperUsuario />
                                </RotaSuperusuario>
                            }
                        />

                        {/* Termos de Uso — acessível publicamente */}
                        <Route path="/termos-de-uso" element={<PaginaTermosDeUso />} />

                        {/* Bloqueia qualquer rota não reconhecida, redirecionando para a raiz */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </AuthProvider>
            </Router>
        </ThemeProvider>
    );
}

export default App;
