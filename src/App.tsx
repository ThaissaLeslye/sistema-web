import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LayoutPrincipal } from "./components/LayoutPrincipal";
import { DadosBancariosProvider } from "./context/DadosBancariosProvider";
import { ClienteDetalhePage } from "./pages/ClienteDetalhePage";
import { ClientesPage } from "./pages/ClientesPage";
import { NovoClientePage } from "./pages/NovoClientePage";
import { PaginaNaoEncontrada } from "./pages/PaginaNaoEncontrada";

function App() {
    return (
        <BrowserRouter>
            <DadosBancariosProvider>
                <LayoutPrincipal>
                    <Routes>
                        <Route path="/" element={<ClientesPage />} />
                        <Route
                            path="/clientes/novo"
                            element={<NovoClientePage />}
                        />
                        <Route
                            path="/clientes/:id"
                            element={<ClienteDetalhePage />}
                        />
                        <Route path="*" element={<PaginaNaoEncontrada />} />
                    </Routes>
                </LayoutPrincipal>
            </DadosBancariosProvider>
        </BrowserRouter>
    );
}

export default App;
