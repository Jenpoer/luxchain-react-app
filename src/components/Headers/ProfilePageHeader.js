import React from "react";

// reactstrap components
import { Container } from "reactstrap";

// core components

function ProfilePageHeader(props) {
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
      <div
        className="page-header clear-filter page-header-small"
        filter-color="blue"
      >
        <div
          className="page-header-image"
          style={{
            backgroundImage: "url(" + require("assets/img/bg5.jpg") + ")",
          }}
          ref={pageHeader}
        ></div>
        <Container>
          {props.isBrand ? (
            <i
              className="now-ui-icons business_badge"
              style={{ fontSize: 100 }}
            ></i>
          ) : (
            <i
              className="now-ui-icons users_single-02"
              style={{ fontSize: 100 }}
            ></i>
          )}

          <h3 className="title">{props.username}</h3>
          <p className="category">{props.address}</p>
          {/* <div className="content">
            <div className="social-description">
              <h2>26</h2>
              <p>Comments</p>
            </div>
            <div className="social-description">
              <h2>26</h2>
              <p>Comments</p>
            </div>
            <div className="social-description">
              <h2>48</h2>
              <p>Bookmarks</p>
            </div>
          </div> */}
        </Container>
      </div>
    </>
  );
}

export default ProfilePageHeader;
