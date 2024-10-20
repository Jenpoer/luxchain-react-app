import React from "react";

// reactstrap components
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Form,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Container,
  Col,
  Alert,
} from "reactstrap";

import { connectWallet } from "dapp/interact";

import { useNavigate } from "react-router-dom";

// core components
import ExamplesNavbar from "components/Navbars/ExamplesNavbar.js";
import TransparentFooter from "components/Footers/TransparentFooter.js";

function LoginPage() {
  const navigate = useNavigate();

  const [firstFocus, setFirstFocus] = React.useState(false);
  const [lastFocus, setLastFocus] = React.useState(false);

  const [status, setStatus] = React.useState({
    color: "info",
    message: "",
    open: false,
  });

  React.useEffect(() => {
    document.body.classList.add("login-page");
    document.body.classList.add("sidebar-collapse");
    document.documentElement.classList.remove("nav-open");
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    return function cleanup() {
      document.body.classList.remove("login-page");
      document.body.classList.remove("sidebar-collapse");
    };
  }, []);

  const handleSignIn = async (e) => {
    e.preventDefault();
    const { address, status: _status } = await connectWallet();
    setStatus({ ..._status, open: true });
    if (_status.color === "success") {
      navigate("/profile/" + address);
    }
  };

  return (
    <>
      <ExamplesNavbar />
      <div className="page-header clear-filter" filter-color="blue">
        <div
          className="page-header-image"
          style={{
            backgroundImage: "url(" + require("assets/img/login.jpg") + ")",
          }}
        ></div>
        <div className="content">
          <Container>
            <Col className="ml-auto mr-auto" md="4">
              <Alert color={status.color} isOpen={status.open}>
                <Container>
                  <div className="alert-icon">
                    <i className="now-ui-icons travel_info"></i>
                  </div>
                  {status.message}
                  <button
                    type="button"
                    className="close"
                    onClick={(e) => {
                      e.preventDefault();
                      setStatus({ ...status, open: false });
                    }}
                  >
                    <span aria-hidden="true">
                      <i className="now-ui-icons ui-1_simple-remove"></i>
                    </span>
                  </button>
                </Container>
              </Alert>
              <Card className="card-login card-plain">
                <Form action="" className="form" method="">
                  <CardHeader className="text-center">
                    <div className="logo-container">
                      <img
                        alt="..."
                        src={require("assets/img/now-logo.png")}
                      ></img>
                    </div>
                    <h4 className="title">Connect to Metamask</h4>
                  </CardHeader>
                  <CardBody>
                    <Button
                      block
                      className="btn-round"
                      color="info"
                      href="#pablo"
                      onClick={handleSignIn}
                      size="lg"
                    >
                      Sign In
                    </Button>
                  </CardBody>
                  <CardFooter className="text-center">
                    <div className="pull-left">
                      <h6>
                        <a
                          className="link"
                          href="#pablo"
                          onClick={(e) => e.preventDefault()}
                        >
                          Create Account
                        </a>
                      </h6>
                    </div>
                    <div className="pull-right">
                      <h6>
                        <a
                          className="link"
                          href="#pablo"
                          onClick={(e) => e.preventDefault()}
                        >
                          Need Help?
                        </a>
                      </h6>
                    </div>
                  </CardFooter>
                </Form>
              </Card>
            </Col>
          </Container>
        </div>
        <TransparentFooter />
      </div>
    </>
  );
}

export default LoginPage;
