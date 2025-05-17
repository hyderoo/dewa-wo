import{S as p,r as x,j as e,a as h,J as l}from"./app-Bs2T8Cel.js";import{G as f}from"./GuestLayout-aQo04gJY.js";import{A as g}from"./arrow-left-BjysdjvJ.js";import"./createLucideIcon-CvzI4D8G.js";const m="font-cormorant font-semibold",s="font-montserrat font-normal";function v({redirect:t}){const{data:r,setData:o,post:d,processing:i,errors:a,reset:c}=p({name:"",email:"",phone:"",password:"",password_confirmation:"",redirect:t||""});x.useEffect(()=>()=>{c("password","password_confirmation")},[]);const u=n=>{n.preventDefault(),d(route("register"))};return e.jsxs(f,{children:[e.jsx(h,{title:"Register"}),e.jsxs("div",{className:"min-h-screen lg:flex",children:[e.jsx("div",{className:"hidden lg:flex lg:w-1/2 bg-pink-50 items-center justify-center p-12",children:e.jsxs("div",{className:"max-w-lg text-center",children:[e.jsx("div",{className:"mb-8",children:e.jsx("div",{className:"relative w-32 h-32 mx-auto",children:e.jsx("img",{src:"/logo.png",alt:"Company Logo",className:"w-full h-full object-contain"})})}),e.jsx("h1",{className:`${m} text-4xl font-semibold text-gray-900 mb-4`,children:"Selamat Datang"}),e.jsx("p",{className:`${s} text-gray-600 text-lg`,children:"Bergabunglah dengan kami untuk mendapatkan pengalaman terbaik dalam merencanakan pernikahan Anda."})]})}),e.jsx("div",{className:"lg:w-1/2 min-h-screen overflow-y-auto bg-white",children:e.jsxs("div",{className:"p-4 sm:p-8 lg:p-12",children:[e.jsxs(l,{href:route("home"),className:"inline-flex items-center text-gray-600 hover:text-gray-900 mb-8",children:[e.jsx(g,{size:20,className:"mr-2"}),e.jsx("span",{className:`${s} text-sm`,children:"Kembali"})]}),e.jsx("div",{className:"lg:hidden flex justify-center mb-8",children:e.jsx("div",{className:"relative w-24 h-24",children:e.jsx("img",{src:"/logo.png",alt:"Company Logo",className:"w-full h-full object-contain"})})}),e.jsx("h2",{className:`
                                ${m}
                                text-3xl
                                text-gray-900
                                mb-8
                                font-semibold
                            `,children:"Buat Akun Baru"}),t&&e.jsx("div",{className:"mb-6 p-4 bg-pink-50 border-l-4 border-pink-500 rounded-md",children:e.jsx("p",{className:`${s} text-sm text-gray-700`,children:"Daftar akun untuk dapat melanjutkan pemesanan"})}),e.jsxs("form",{onSubmit:u,className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("label",{htmlFor:"name",className:`
                                        ${s}
                                        block text-sm font-medium text-gray-700 mb-2
                                    `,children:"Nama Lengkap"}),e.jsx("input",{type:"text",id:"name",name:"name",value:r.name,onChange:n=>o("name",n.target.value),required:!0,className:`
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
                                    `,placeholder:"Masukkan nama lengkap"}),a.name&&e.jsx("div",{className:"text-red-500 text-sm mt-1",children:a.name})]}),e.jsxs("div",{children:[e.jsx("label",{htmlFor:"email",className:`
                                        ${s}
                                        block text-sm font-medium text-gray-700 mb-2
                                    `,children:"Email"}),e.jsx("input",{type:"email",id:"email",name:"email",value:r.email,onChange:n=>o("email",n.target.value),required:!0,className:`
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
                                    `,placeholder:"contoh@email.com"}),a.email&&e.jsx("div",{className:"text-red-500 text-sm mt-1",children:a.email})]}),e.jsxs("div",{children:[e.jsx("label",{htmlFor:"phone",className:`
                                        ${s}
                                        block text-sm font-medium text-gray-700 mb-2
                                    `,children:"Nomor Telepon"}),e.jsx("input",{type:"tel",id:"phone",name:"phone",value:r.phone,onChange:n=>o("phone",n.target.value),required:!0,className:`
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
                                    `,placeholder:"Masukkan nomor telepon"}),a.phone&&e.jsx("div",{className:"text-red-500 text-sm mt-1",children:a.phone})]}),e.jsxs("div",{children:[e.jsx("label",{htmlFor:"password",className:`
                                        ${s}
                                        block text-sm font-medium text-gray-700 mb-2
                                    `,children:"Kata Sandi"}),e.jsx("input",{type:"password",id:"password",name:"password",value:r.password,onChange:n=>o("password",n.target.value),required:!0,className:`
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
                                    `,placeholder:"Buat kata sandi"}),a.password&&e.jsx("div",{className:"text-red-500 text-sm mt-1",children:a.password})]}),e.jsxs("div",{children:[e.jsx("label",{htmlFor:"password_confirmation",className:`
                                        ${s}
                                        block text-sm font-medium text-gray-700 mb-2
                                    `,children:"Konfirmasi Kata Sandi"}),e.jsx("input",{type:"password",id:"password_confirmation",name:"password_confirmation",value:r.password_confirmation,onChange:n=>o("password_confirmation",n.target.value),required:!0,className:`
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
                                    `,placeholder:"Ulangi kata sandi"}),a.password_confirmation&&e.jsx("div",{className:"text-red-500 text-sm mt-1",children:a.password_confirmation})]}),t&&e.jsx("input",{type:"hidden",name:"redirect",value:r.redirect}),e.jsx("button",{type:"submit",disabled:i,className:`
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
                                `,children:i?"Processing...":"Daftar"})]}),e.jsx("div",{className:"mt-8 text-center",children:e.jsxs("p",{className:`
                                    ${s}
                                    text-sm
                                    text-gray-600
                                `,children:["Sudah punya akun?"," ",e.jsx(l,{href:route("login",t?{redirect:t}:{}),className:`
                                        text-pink-500
                                        hover:text-pink-600
                                        font-medium
                                        transition-colors
                                    `,children:"Masuk"})]})})]})})]})]})}export{v as default};
