import { Loader2 } from "lucide-react";

export default function LoadingComponent() {
    return(
        <div className="w-full h-full flex items-center justify-center">
            <Loader2 className="mr-2 md:mr-3 h-6 w-6 md:h-10 md:w-10 animate-spin" />
            Loading
    </div>
    )
}