import footerLogo from "../../assets/footerLogo.svg"
import facebookFooter from "../../assets/facebookFooter.svg";
import instagramFooter from "../../assets/instagramFooter.svg";
import twitterFooter from "../../assets/twitterFooter.svg";
import googleFooter from "../../assets/googleFooter.svg";
import "./index.css";

const Footer = () => {
  return (
    <div className="footer-container">
      <div className="footer-logo-section">
        <div className="footer-divider-line"></div>
        <img src={footerLogo} alt="Icon" className="footer-logo" />
        <div className="footer-divider-line"></div>
      </div>
      <div className="footer-social-wrapper">
        <div className="footer-social-icons">
          <img src={facebookFooter} alt="Facebook" className="footer-icon" />
          <img src={instagramFooter} alt="Instagram" className="footer-icon" />
          <img src={twitterFooter} alt="Twitter" className="footer-icon" />
          <img src={googleFooter} alt="Google" className="footer-icon" />
        </div>
      </div>
      <div className="footer-text-section">
        <p className="footer-terms-text">
          Terms & Conditions Privacy Policy
        </p>
        <p className="footer-copyright-text">
          Copy Right © Clap Kartel. All Rights Reserved | Concept & Designed by
          eParivartan
        </p>
      </div>
    </div>
  );
};

export default Footer;