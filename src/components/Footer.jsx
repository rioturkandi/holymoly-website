function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-neutral-800 bg-[#100C08] py-10 pb-16 min-[390px]:py-12 min-[390px]:pb-16 sm:py-14 sm:pb-16 md:py-16 md:pb-16">
      <div className="page-container">
        <div className="grid grid-cols-1 gap-8 sm:gap-10 md:grid-cols-2 md:items-start md:gap-12">

          {/* LOCATION */}
          <div>
            <p className="mb-3 text-[14px] min-[360px]:text-[15px] min-[390px]:text-base sm:mb-4 sm:text-lg md:mb-5 md:text-xl font-bold uppercase tracking-[0.16em] text-white">
              Find Our Workshop
            </p>

            <div className="w-full overflow-hidden rounded-xl border border-white/10 bg-[#1b1b1b] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(0,0,0,0.35)]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.614927528361!2d107.6922043749968!3d-6.936541393063493!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68c30051906ef9%3A0x2a9250247fcb9acf!2sHoly%20Moly%20Service!5e0!3m2!1sid!2sid!4v1794437080132!5m2!1sid!2sid"
                title="Holy Moly Service Google Maps Location"
                className="aspect-[16/9] w-full"
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>

            <a
              href="https://www.google.com/maps/search/?api=1&query=Holy+Moly+Service"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 min-[390px]:mt-4 inline-flex min-h-10 items-center text-xs min-[360px]:text-[13px] min-[390px]:text-sm text-neutral-400 transition-colors hover:text-white"
            >
              Jl. Soekarno Hatta No. 816, Bandung
            </a>
          </div>

          {/* CONNECT */}
          <div className="md:text-right">
            <p className="mb-3 text-[14px] min-[360px]:text-[15px] min-[390px]:text-base sm:mb-4 sm:text-lg md:mb-5 md:text-xl font-bold uppercase tracking-[0.16em] text-white">
              Connect With Us
            </p>

            <div className="flex flex-col items-start gap-2 sm:gap-3 md:items-end">
              <a
                href="https://www.instagram.com/holymoly__service/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram HOLYMOLY"
                className="inline-flex min-h-10 items-center gap-3 text-xs min-[360px]:text-[13px] min-[390px]:text-sm text-neutral-300 transition-colors hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
                </svg>
                <span>@holymoly__service</span>
              </a>

              {[
                { name: 'Herdi', phone: '6282177777598', display: '+62 821-7777-7598' },
                { name: 'Hafiz', phone: '6281218216992', display: '+62 812-1821-6992' },
                { name: 'Mivtah', phone: '6281257778771', display: '+62 812-5777-8771' },
              ].map((contact) => (
                <a
                  key={contact.name}
                  href={`https://wa.me/${contact.phone}?text=${encodeURIComponent('Halo, saya tertarik untuk mengetahui lebih lanjut tentang layanan HOLYMOLY.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`WhatsApp ${contact.name}`}
                  className="inline-flex min-h-10 items-center gap-3 text-xs min-[360px]:text-[13px] min-[390px]:text-sm text-neutral-300 transition-colors hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="shrink-0">
                    <path d="M20.52 3.48A11.85 11.85 0 0 0 12.08 0C5.52 0 .18 5.34.18 11.9c0 2.1.55 4.15 1.6 5.96L.08 24l6.29-1.65a11.9 11.9 0 0 0 5.7 1.45h.01c6.56 0 11.9-5.34 11.9-11.9a11.84 11.84 0 0 0-3.46-8.42ZM12.08 21.8h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.73.98 1-3.64-.23-.37a9.88 9.88 0 0 1-1.52-5.28c0-5.46 4.45-9.9 9.9-9.9a9.84 9.84 0 0 1 7 2.9 9.84 9.84 0 0 1 2.9 7c0 5.46-4.44 9.9-9.9 9.9Zm5.43-7.42c-.3-.15-1.77-.87-2.05-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.48-1.77-1.65-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.09 4.49.71.3 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35Z" />
                  </svg>
                  <span>{contact.name} {contact.display}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="mt-8 border-t border-neutral-800 pt-4 text-[10px] min-[390px]:text-[11px] sm:text-xs leading-6 text-neutral-500 sm:mt-10 sm:pt-5 md:mt-12 md:pt-6">
          <p>© {currentYear} HOLYMOLY. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
