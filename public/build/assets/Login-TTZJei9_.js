import{S as h,r as g,j as e,a as f,J as o}from"./app-Bj-2ttWe.js";import{G as b}from"./GuestLayout-BekGNx7A.js";import{A as j}from"./arrow-left-CNY0Mjs2.js";import"./createLucideIcon-Q6M-lg5u.js";const c="font-cormorant font-semibold",a="font-montserrat font-normal",d="font-montserrat font-medium";function $({status:i,canResetPassword:k,redirect:n}){const{data:t,setData:l,post:x,processing:m,errors:r,reset:u}=h({email:"",password:"",remember:!1,redirect:n||""});g.useEffect(()=>()=>{u("password")},[]);const p=s=>{s.preventDefault(),x(route("login"))};return e.jsxs(b,{children:[e.jsx(f,{title:"Log in"}),i&&e.jsx("div",{className:"mb-4 font-medium text-sm text-green-600",children:i}),e.jsxs("div",{className:"min-h-screen lg:flex",children:[e.jsx("div",{className:"hidden lg:flex lg:w-1/2 bg-pink-50 items-center justify-center p-12",children:e.jsxs("div",{className:"max-w-lg text-center",children:[e.jsx("div",{className:"mb-8",children:e.jsx("div",{className:"relative w-32 h-32 mx-auto",children:e.jsx("img",{src:"/logo.png",alt:"Company Logo",className:"w-full h-full object-contain"})})}),e.jsx("h1",{className:`${c} text-4xl font-semibold text-gray-900 mb-4`,children:"Selamat Datang Kembali"}),e.jsx("p",{className:`${a} text-gray-600 text-lg`,children:"Silakan masuk ke akun Anda untuk melanjutkan perencanaan pernikahan impian Anda."})]})}),e.jsx("div",{className:"lg:w-1/2 min-h-screen overflow-y-auto bg-white",children:e.jsxs("div",{className:"p-4 sm:p-8 lg:p-12",children:[e.jsxs(o,{href:route("home"),className:"inline-flex items-center text-gray-600 hover:text-gray-900 mb-8",children:[e.jsx(j,{size:20,className:"mr-2"}),e.jsx("span",{className:`${a} text-sm`,children:"Kembali"})]}),e.jsx("div",{className:"lg:hidden flex justify-center mb-8",children:e.jsx("div",{className:"relative w-24 h-24",children:e.jsx("img",{src:"/logo.png",alt:"Company Logo",className:"w-full h-full object-contain"})})}),e.jsx("h2",{className:`
                                ${c}
                                text-3xl
                                text-gray-900
                                mb-8
                                font-semibold
                            `,children:"Masuk ke Akun"}),n&&e.jsx("div",{className:"mb-6 p-4 bg-pink-50 border-l-4 border-pink-500 rounded-md",children:e.jsx("p",{className:`${a} text-sm text-gray-700`,children:"Silakan login terlebih dahulu untuk melanjutkan pemesanan"})}),e.jsxs("form",{onSubmit:p,className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("label",{htmlFor:"email",className:`
                                        ${d}
                                        block text-sm font-medium text-gray-700 mb-2
                                    `,children:"Email"}),e.jsx("input",{type:"email",id:"email",name:"email",value:t.email,onChange:s=>l("email",s.target.value),required:!0,className:`
                                        w-full
                                        px-4
                                        py-3
                                        border
                                        border-gray-200
                                        rounded-md
                                        focus:outline-none
                                        focus:ring-2
                                        focus:ring-pink-200
                                        focus:border-pink-300
                                        transition-colors
                                    `,placeholder:"contoh@email.com"}),r.email&&e.jsx("div",{className:"text-red-500 text-sm mt-1",children:r.email})]}),e.jsxs("div",{children:[e.jsx("label",{htmlFor:"password",className:`
                                        ${d}
                                        block text-sm font-medium text-gray-700 mb-2
                                    `,children:"Kata Sandi"}),e.jsx("input",{type:"password",id:"password",name:"password",value:t.password,onChange:s=>l("password",s.target.value),required:!0,className:`
                                        w-full
                                        px-4
                                        py-3
                                        border
                                        border-gray-200
                                        rounded-md
                                        focus:outline-none
                                        focus:ring-2
                                        focus:ring-pink-200
                                        focus:border-pink-300
                                        transition-colors
                                    `,placeholder:"Masukkan kata sandi"}),r.password&&e.jsx("div",{className:"text-red-500 text-sm mt-1",children:r.password})]}),e.jsx("div",{className:"flex items-center justify-between",children:e.jsxs("div",{className:"flex items-center",children:[e.jsx("input",{type:"checkbox",id:"remember",name:"remember",checked:t.remember,onChange:s=>l("remember",s.target.checked),className:"h-4 w-4 text-pink-500 focus:ring-pink-400 border-gray-300 rounded"}),e.jsx("label",{htmlFor:"remember",className:`
                                            ${a}
                                            ml-2 block text-sm text-gray-700
                                        `,children:"Ingat saya"})]})}),n&&e.jsx("input",{type:"hidden",name:"redirect",value:t.redirect}),e.jsx("button",{type:"submit",disabled:m,className:`
                                    w-full
                                    bg-pink-500
                                    text-white
                                    px-4
                                    py-3
                                    rounded-md
                                    text-sm
                                    font-medium
                                    tracking-wide
                                    hover:bg-pink-600
                                    transition-colors
                                    shadow-sm
                                    disabled:opacity-75
                                `,children:m?"Processing...":"Masuk"})]}),e.jsx("div",{className:"mt-8 text-center",children:e.jsxs("p",{className:`
                                    ${a}
                                    text-sm
                                    text-gray-600
                                `,children:["Belum punya akun?"," ",e.jsx(o,{href:route("register",n?{redirect:n}:{}),className:`
                                        text-pink-500
                                        hover:text-pink-600
                                        font-medium
                                        transition-colors
                                    `,children:"Daftar"})]})})]})})]})]})}export{$ as default};
