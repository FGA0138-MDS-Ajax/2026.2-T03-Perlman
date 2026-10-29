import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider, RotaProtegida, RotaAdmin, RotaPublica } from "@/lib/auth-context";
import PaginaInterfaceInicial from "@/pages-user/pagina-interface-inicial";
import PaginaLogin from "@/pages-user/pagina-login";
import PaginaCadastro from "@/pages-user/pagina-cadastro";
import PaginaPrincipal from "@/pages-user/pagina-principal";
import PaginaPainelAdmin from "@/pages-admin/pagina-painel-admin";

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

                        {/* Painel Administrativo: Exige usuário logado E e-mail no banco de administradores */}
                        <Route
                            path="/admin"
                            element={
                                <RotaAdmin>
                                    <PaginaPainelAdmin />
                                </RotaAdmin>
                            }
                        />

                        {/* Bloqueia qualquer rota não reconhecida, redirecionando para a raiz */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </AuthProvider>
            </Router>
        </ThemeProvider>
    );
}

export default App;
