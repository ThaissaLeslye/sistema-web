import { useState, type ReactNode } from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import { Link, NavLink } from "react-router-dom";

interface LayoutPrincipalProps {
    children: ReactNode;
}

export function LayoutPrincipal({ children }: LayoutPrincipalProps) {
    const [menuAberto, setMenuAberto] = useState(false);

    const fecharMenu = (): void => {
        setMenuAberto(false);
    };

    return (
        <>
            <a href="#conteudo-principal" className="skip-link">
                Pular para o conteúdo principal
            </a>

            <header>
                <Navbar
                    expand="md"
                    variant="dark"
                    expanded={menuAberto}
                    onToggle={setMenuAberto}
                    style={{ backgroundColor: "var(--cor-primaria-escura)" }}
                >
                    <Container
                        style={{ maxWidth: "var(--largura-maxima-container)" }}
                    >
                        <Link
                            to="/"
                            className="navbar-brand d-flex flex-column py-0"
                            onClick={fecharMenu}
                        >
                            <span className="fw-bold fs-5 lh-sm">
                                Sistema Web
                            </span>
                            <span
                                className="opacity-75"
                                style={{ fontSize: "0.75rem" }}
                            >
                                Gestão de Clientes
                            </span>
                        </Link>

                        <Navbar.Toggle
                            aria-controls="navegacao-principal"
                            aria-label="Alternar menu de navegação"
                        />

                        <Navbar.Collapse id="navegacao-principal">
                            <Nav
                                className="ms-auto gap-md-2"
                                aria-label="Navegação principal"
                            >
                                <Nav.Item>
                                    <NavLink
                                        to="/"
                                        end
                                        onClick={fecharMenu}
                                        className={({ isActive }) =>
                                            `nav-link${isActive ? " active fw-semibold" : ""}`
                                        }
                                    >
                                        Clientes
                                    </NavLink>
                                </Nav.Item>
                                <Nav.Item>
                                    <NavLink
                                        to="/clientes/novo"
                                        onClick={fecharMenu}
                                        className={({ isActive }) =>
                                            `nav-link${isActive ? " active fw-semibold" : ""}`
                                        }
                                    >
                                        Novo Cliente
                                    </NavLink>
                                </Nav.Item>
                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
            </header>

            <main id="conteudo-principal" className="flex-grow-1 py-4">
                <Container
                    style={{ maxWidth: "var(--largura-maxima-container)" }}
                >
                    {children}
                </Container>
            </main>

            <footer
                className="border-top bg-white py-3 mt-auto"
                style={{
                    color: "var(--cor-texto-secundario)",
                    fontSize: "0.875rem",
                }}
            >
                <Container
                    style={{ maxWidth: "var(--largura-maxima-container)" }}
                    className="text-center"
                >
                    Suporte: Central de Atendimento · Sistema Web
                </Container>
            </footer>
        </>
    );
}
