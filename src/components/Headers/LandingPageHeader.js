import React from "react";

// reactstrap components
import { Button, Container } from "reactstrap";

// core components

function LandingPageHeader(props) {
  let pageHeader = React.createRef();

  React.useEffect(() => {
    if (window.innerWidth > 991) {
      const updateScroll = () => {
        let windowScrollTop = window.pageYOffset / 3;
        pageHeader.current.style.transform =
          "translate3d(0," + windowScrollTop + "px,0)";
      };
      window.addEventListener("scroll", updateScroll);
      return function cleanup() {
        window.removeEventListener("scroll", updateScroll);
      };
    }
  });
  return (
    <>
      <div className="page-header clear-filter page-header-small" filter-color="blue">
        <div
          className="page-header-image"
          style={{
            backgroundImage: "url(" + require("assets/img/bg8.jpg") + ")",
          }}
          ref={pageHeader}
        ></div>
        <div className="content-center">
          <Container>
            <h1 className="title">{props.assetName}</h1>
            <div className="text-center">
              <h3>ID: {props.assetId}</h3>
            </div>
          </Container>
        </div>
      </div>
    </>
  );
}

export default LandingPageHeader;
