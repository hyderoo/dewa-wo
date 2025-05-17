import{S as a,r,j as e,a as n}from"./app-Bj-2ttWe.js";import{L as i}from"./log-out-DiVVTNjJ.js";import"./createLucideIcon-Q6M-lg5u.js";const d=()=>{const{post:t}=a();return r.useEffect(()=>{const s=setTimeout(()=>{t(route("logout"))},3e3);return()=>clearTimeout(s)},[]),e.jsxs(e.Fragment,{children:[e.jsx(n,{title:"Logging Out"}),e.jsx("div",{className:"min-h-screen flex items-center justify-center bg-gray-50",children:e.jsxs("div",{className:"w-full max-w-md p-8 flex flex-col items-center",children:[e.jsxs("div",{className:"mb-6 animate-fade-in",children:[e.jsx("div",{className:"bg-white rounded-full p-6 shadow-md mb-6",children:e.jsx(i,{className:"w-12 h-12 text-gray-600 animate-bounce",strokeWidth:1.5})}),e.jsx("h1",{className:"font-cormorant font-light text-3xl text-center text-gray-800 mb-2",children:"Logging Out"}),e.jsx("p",{className:"text-gray-600 text-center text-sm tracking-wide",children:"Thank you for using Dewa Management"})]}),e.jsx("div",{className:"w-full bg-gray-200 h-1 rounded-full overflow-hidden",children:e.jsx("div",{className:"h-full bg-gray-600 rounded-full transition-all duration-3000 ease-out",style:{width:"100%",animation:"progress 3s linear"}})})]})}),e.jsx("style",{jsx:"true",children:`
                .animate-fade-in {
                    animation: fadeIn 0.5s ease-out;
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes progress {
                    from {
                        width: 0%;
                    }
                    to {
                        width: 100%;
                    }
                }
            `})]})};export{d as default};
