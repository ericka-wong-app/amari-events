export default function RouteSketch() {
  return (
    <svg
      viewBox="0 0 400 940"
      className="mx-auto w-full max-w-sm"
      role="img"
      aria-label="Route sketch from WalterMart Santa Rosa to Okairi"
    >
      <path
        d="M85,70 C85,140 300,150 300,220 C300,300 90,300 90,390 C90,470 300,470 300,560 C300,640 110,660 110,730 C110,800 300,800 300,860"
        fill="none"
        stroke="#f4cdd1"
        strokeWidth="20"
        strokeLinecap="round"
      />
      <path
        d="M85,70 C85,140 300,150 300,220 C300,300 90,300 90,390 C90,470 300,470 300,560 C300,640 110,660 110,730 C110,800 300,800 300,860"
        fill="none"
        stroke="#d17b83"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M300,560 C330,600 335,660 300,700"
        fill="none"
        stroke="#d98a8a"
        strokeWidth="4"
        strokeDasharray="3 7"
        strokeLinecap="round"
      />
      <g transform="translate(340,632)">
        <rect x="-8" y="-13" width="72" height="26" rx="8" fill="#fdeaea" stroke="#d98a8a" strokeDasharray="3 4" />
        <text x="28" y="4" textAnchor="middle" fontSize="10" fill="#b05a5a" fontWeight="700">AVOID</text>
      </g>
      <circle cx="85" cy="70" r="9" fill="#fff" stroke="#d9ad24" strokeWidth="4" />
      <g transform="translate(105,56)">
        <rect width="182" height="30" rx="9" fill="#f7dd86" stroke="#d9ad24" strokeWidth="2" />
        <text x="14" y="20" fontSize="13" fontWeight="700" fill="#6b5200">START · WalterMart Sta. Rosa</text>
      </g>
      <circle cx="300" cy="220" r="7" fill="#fff" stroke="#e18a2e" strokeWidth="3" />
      <g transform="translate(96,206)">
        <rect width="196" height="28" rx="8" fill="#f6bd7c" stroke="#e18a2e" strokeWidth="2" />
        <text x="13" y="19" fontSize="12.5" fontWeight="600" fill="#7a4310">{"Mima The Baker's Partner"}</text>
      </g>
      <circle cx="90" cy="390" r="7" fill="#fff" stroke="#e18a2e" strokeWidth="3" />
      <g transform="translate(110,376)">
        <rect width="168" height="28" rx="8" fill="#f6bd7c" stroke="#e18a2e" strokeWidth="2" />
        <text x="13" y="19" fontSize="12.5" fontWeight="600" fill="#7a4310">Balibago Market</text>
      </g>
      <circle cx="300" cy="560" r="7" fill="#fff" stroke="#d17b83" strokeWidth="3" />
      <g transform="translate(70,528)">
        <rect width="176" height="26" rx="8" fill="#fff" stroke="#d17b83" strokeWidth="1.5" />
        <text x="12" y="17" fontSize="11.5" fontWeight="600" fill="#d17b83">Keep RIGHT on the curve →</text>
      </g>
      <circle cx="110" cy="730" r="7" fill="#fff" stroke="#e18a2e" strokeWidth="3" />
      <g transform="translate(130,716)">
        <rect width="196" height="28" rx="8" fill="#f6bd7c" stroke="#e18a2e" strokeWidth="2" />
        <text x="13" y="19" fontSize="12.5" fontWeight="600" fill="#7a4310">J&amp;T Express Sta. Rosa CP-2</text>
      </g>
      <circle cx="300" cy="860" r="10" fill="#fff" stroke="#4f9b52" strokeWidth="4" />
      <g transform="translate(96,872)">
        <rect width="204" height="34" rx="10" fill="#8fd08a" stroke="#4f9b52" strokeWidth="2.5" />
        <text x="15" y="16" fontSize="13" fontWeight="700" fill="#245a26">OKAIRI · Reception</text>
        <text x="15" y="28" fontSize="10.5" fill="#245a26">B2 L10 Ph 1, La Joya Subd.</text>
      </g>
    </svg>
  );
}
