import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PaginaInterfaceInicial from "@/pages-user/pagina-interface-inicial";
import PaginaLogin from "@/pages-user/pagina-login";
import PaginaCadastro from "@/pages-user/pagina-cadastro";
import PaginaPrincipal from "@/pages-user/pagina-principal";
import PaginaPainelAdmin from "@/pages-admin/pagina-painel-admin";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<PaginaInterfaceInicial />} />
                <Route path="/login" element={<PaginaLogin />} />
                <Route path="/cadastro" element={<PaginaCadastro />} />
                <Route path="/principal" element={<PaginaPrincipal />} />
                <Route path="/admin" element={<PaginaPainelAdmin />} />
            </Routes>
        </Router>
    );
}

export default App;
