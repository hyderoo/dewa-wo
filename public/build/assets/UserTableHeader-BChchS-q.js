import{j as e}from"./app-Bs2T8Cel.js";import{c as s}from"./createLucideIcon-CvzI4D8G.js";/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const i=[["path",{d:"M12 5v14",key:"s699le"}],["path",{d:"m19 12-7 7-7-7",key:"1idqje"}]],l=s("arrow-down",i);/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=[["path",{d:"m5 12 7-7 7 7",key:"hav0vg"}],["path",{d:"M12 19V5",key:"x0mq9r"}]],o=s("arrow-up",m),p=({sortField:a,sortDirection:c,onSort:t})=>{const r=n=>n!==a?null:c==="asc"?e.jsx(o,{className:"w-4 h-4 inline-block ml-1"}):e.jsx(l,{className:"w-4 h-4 inline-block ml-1"});return e.jsx("thead",{className:"bg-gray-100 border-b",children:e.jsxs("tr",{children:[e.jsx("th",{className:"p-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200",onClick:()=>t("name"),children:e.jsxs("span",{className:"flex items-center",children:["Name ",r("name")]})}),e.jsx("th",{className:"p-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200",onClick:()=>t("phone"),children:e.jsxs("span",{className:"flex items-center",children:["Phone ",r("phone")]})}),e.jsx("th",{className:"p-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200",onClick:()=>t("email"),children:e.jsxs("span",{className:"flex items-center",children:["Email ",r("email")]})}),e.jsx("th",{className:"p-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200",onClick:()=>t("role"),children:e.jsxs("span",{className:"flex items-center",children:["Role ",r("role")]})}),e.jsx("th",{className:"p-3 text-center text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider",children:"Actions"})]})})};export{p as default};
