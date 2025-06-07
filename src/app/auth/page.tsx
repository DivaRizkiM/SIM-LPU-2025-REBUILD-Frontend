import AuthenticationPage from "@/components/pages/Login";
// import dynamic from "next/dynamic";

// const LoginComp = dynamic(()=>import('@/components/pages/Login'),{
//     ssr: false
// })
export default function Auth() {
    
    return(
        <AuthenticationPage/>
    )
}