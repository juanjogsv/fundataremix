import logoImage from "@/assets/fundacion-luker-color-letra-blanca-horizontal.png.asset.json";

const logoUrl = logoImage.url;

export const InstitutionalFooter = () => (
  <footer className="institutional-footer">
    <div className="institutional-footer__inner">
      <img src={logoUrl} alt="Fundación Luker" className="institutional-footer__logo" />
      <div>
        <p className="institutional-footer__title">Mi Junta</p>
        <p className="institutional-footer__copy">Información para decidir, aprender y transformar.</p>
      </div>
      <p className="institutional-footer__legal">© 2026 Fundación Luker</p>
    </div>
    <div className="institutional-color-strip" aria-hidden="true">
      <span /><span /><span /><span />
    </div>
  </footer>
);