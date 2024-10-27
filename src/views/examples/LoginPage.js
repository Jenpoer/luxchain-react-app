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

import {
  connectWallet,
  getDigitalIdentity,
  registerDigitalIdentity,
} from "dapp/interact";

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

  const [username, setUsername] = React.useState("");

  React.useEffect(() => {
    document.body.classList.add("login-page");
    document.body.classList.add("sidebar-collapse");
    document.documentElement.classList.remove("nav-open");
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    return function cleanup() {
      console.log("cleanup");
      document.body.classList.remove("login-page");
      document.body.classList.remove("sidebar-collapse");
    };
  }, []);

  const handleSignIn = async (e) => {
    e.preventDefault();

    try {
      if (username === "") {
        throw new Error("Please enter a username!");
      }

      const { address, status: _status } = await connectWallet();

      if (_status.color === "danger") {
        throw new Error(_status.message);
      }

      const digitalIdentity = await getDigitalIdentity(address);

      if (digitalIdentity.name === "") {
        // Create digital identity
        const { status: _status } = await registerDigitalIdentity(username);
      } else if (digitalIdentity.name != username) {
        throw new Error("Wrong username!");
      }

      // If you get to this point, means everything went well
      // Login to the profile
      navigate("/profile/" + address);
    } catch (error) {
      setStatus({
        color: "danger",
        message: error.message,
        open: true,
      });
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
                    <InputGroup
                      className={
                        "no-border" + (firstFocus ? " input-group-focus" : "")
                      }
                    >
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="now-ui-icons users_circle-08"></i>
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input
                        placeholder="Username..."
                        type="text"
                        value={username}
                        onFocus={() => setFirstFocus(true)}
                        onBlur={() => setFirstFocus(false)}
                        onChange={(e) => setUsername(e.target.value)}
                      ></Input>
                    </InputGroup>
                    <Button
                      block
                      className="btn-round"
                      color="info"
                      onClick={handleSignIn}
                      size="lg"
                    >
                      Sign In
                    </Button>
                  </CardBody>
                  <CardFooter className="text-center">
                    {/* <div className="pull-left">
                      <h6>
                        <a
                          className="link"
                          href=""
                          onClick={(e) => {
                            e.preventDefault();
                           }}
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
                    </div> */}
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
