import LogoImg from "../../assets/img_-_logo.jpg";

export default function Contact() {
  return (
    <div className="pagePad">
      <div className="eventDetailBlock contactWrap">
        <div className="contactHeroCard">
          <img className="contactLogo" src={LogoImg} alt="First Step logo" />

          <div className="contactHeroText">
            <div className="contactHeroTitle">We&apos;re here to help!</div>
            <div className="contactHeroDesc">
              Please reach out if you have any questions or need assistance.
            </div>
          </div>
        </div>

        <div className="contactList">
          <div className="contactRow">
            <span className="contactIcon" aria-hidden="true">
              ☎
            </span>
            <span className="contactValue">(123) 456-7890</span>
          </div>

          <div className="contactRow">
            <span className="contactIcon" aria-hidden="true">
              ✉
            </span>
            <span className="contactValue">info@firststep-school.com</span>
          </div>

          <div className="contactRow">
            <span className="contactIcon" aria-hidden="true">
              ⌖
            </span>
            <span className="contactValue">
              123 School St,
              <br />
              Hometown, CA 91001
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}