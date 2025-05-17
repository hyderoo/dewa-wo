import{j as t,J as s}from"./app-Bs2T8Cel.js";const i="font-cormorant font-light",m=({service:e,onBuyClick:r,isAuthenticated:a})=>{const l=()=>{a&&r(e)};return t.jsxs("div",{className:"group px-4 text-center sm:px-0 bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:scale-105",children:[t.jsx("div",{className:"mx-auto mb-6 h-64 w-full overflow-hidden",children:t.jsx("img",{src:e.image,alt:e.name,className:"h-full w-full object-cover transition-all duration-300 group-hover:scale-110"})}),t.jsx("h3",{className:`
                    ${i}
                    mt-4
                    mb-2
                    text-xl
                    font-light
                    text-black
                    tracking-wide
                    sm:mb-3
                    sm:text-2xl
                `,children:e.name}),t.jsx("p",{className:"mb-3 text-gray-600 px-4 sm:px-6 h-24 overflow-hidden",children:e.description}),t.jsx("ul",{className:"mb-6 px-4 text-left text-gray-700",children:e.features&&Array.isArray(e.features)&&e.features.map((n,o)=>t.jsxs("li",{className:"py-1 border-b last:border-b-0 border-gray-200",children:["✓ ",n]},o))}),a?t.jsx("button",{onClick:l,className:"mb-4 bg-pink-600 text-white px-6 py-2 rounded-full hover:bg-pink-700 transition duration-300",children:"Pilih Paket"}):t.jsx(s,{href:route("login",{redirect:route("features")}),className:"mb-4 inline-block bg-pink-600 text-white px-6 py-2 rounded-full hover:bg-pink-700 transition duration-300",children:"Login untuk Pesan"})]})};export{m as default};
