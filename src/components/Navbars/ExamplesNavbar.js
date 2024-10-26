import React from "react";
import { Link } from "react-router-dom";
// reactstrap components
import {
  Collapse,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  NavbarBrand,
  Navbar,
  NavItem,
  NavLink,
  Nav,
  NavbarText,
  Container,
  UncontrolledTooltip,
} from "reactstrap";

import { getDigitalIdentity, getCurrentWalletConnected } from "dapp/interact";

function ExamplesNavbar() {
  const [navbarColor, setNavbarColor] = React.useState("navbar-transparent");
  const [collapseOpen, setCollapseOpen] = React.useState(false);
  const [username, setUsername] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [isBrand, setIsBrand] = React.useState(false);

  React.useEffect(() => {
    const updateNavbarColor = () => {
      if (
        document.documentElement.scrollTop > 399 ||
        document.body.scrollTop > 399
      ) {
        setNavbarColor("");
      } else if (
        document.documentElement.scrollTop < 400 ||
        document.body.scrollTop < 400
      ) {
        setNavbarColor("navbar-transparent");
      }
    };
    window.addEventListener("scroll", updateNavbarColor);
    return function cleanup() {
      window.removeEventListener("scroll", updateNavbarColor);
    };
  });

  React.useEffect(async () => {
    const { address, status } = await getCurrentWalletConnected();

    if (status.color == "success") {
      setAddress(address);
      const digitalIdentity = await getDigitalIdentity(address);
      setUsername(digitalIdentity.name);
      setIsBrand(digitalIdentity.isBrand);
    }
  }, []);

  return (
    <>
      {collapseOpen ? (
        <div
          id="bodyClick"
          onClick={() => {
            document.documentElement.classList.toggle("nav-open");
            setCollapseOpen(false);
          }}
        />
      ) : null}
      <Navbar className={"fixed-top " + navbarColor} color="info" expand="lg">
        <Container>
          <div className="navbar-translate">
            <NavbarBrand href="/index" id="navbar-brand">
              LuxChain
            </NavbarBrand>
            <button
              className="navbar-toggler navbar-toggler"
              onClick={() => {
                document.documentElement.classList.toggle("nav-open");
                setCollapseOpen(!collapseOpen);
              }}
              aria-expanded={collapseOpen}
              type="button"
            >
              <span className="navbar-toggler-bar top-bar"></span>
              <span className="navbar-toggler-bar middle-bar"></span>
              <span className="navbar-toggler-bar bottom-bar"></span>
            </button>
          </div>
          <Collapse
            className="justify-content-end"
            isOpen={collapseOpen}
            navbar
          >
            <Nav navbar>
              <NavItem>
                {username === "" ? (
                  <NavLink href="/login">Login</NavLink>
                ) : (
                  <NavLink href={"/profile/" + address}>
                    {" "}
                    {isBrand ? (
                      <i className="now-ui-icons business_badge"></i>
                    ) : (
                      <i className="now-ui-icons users_single-02"></i>
                    )}
                    &nbsp;
                    {username}
                  </NavLink>
                )}
              </NavItem>
            </Nav>
          </Collapse>
        </Container>
      </Navbar>
    </>
  );
}

export default ExamplesNavbar;
