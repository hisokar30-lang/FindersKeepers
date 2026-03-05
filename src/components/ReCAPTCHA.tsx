"use client";

import { useState } from "react";
import { Check } from "lucide-react";

interface ReCAPTCHAProps {
    onVerify: (verified: boolean) => void;
}

export default function ReCAPTCHA({ onVerify }: ReCAPTCHAProps) {
    const [verified, setVerified] = useState(false);

    const handleToggle = () => {
        const nextState = !verified;
        setVerified(nextState);
        onVerify(nextState);
    };

    return (
        <div
            className="flex items-center gap-3 p-3 bg-[#f9f9f9] border border-[#d3d3d3] rounded-[3px] w-[300px] h-[74px] shadow-sm select-none cursor-pointer hover:bg-[#f0f0f0] transition-colors"
            onClick={handleToggle}
        >
            <div className="flex items-center justify-center w-[28px] h-[28px] bg-white border-2 border-[#c1c1c1] rounded-[2px] relative">
                {verified && (
                    <Check size={20} className="text-[#009b00] stroke-[4]" />
                )}
            </div>
            <span className="text-[14px] text-black font-normal font-sans">I'm not a robot</span>

            <div className="ml-auto flex flex-col items-center justify-center text-[10px] text-[#555] gap-0.5 opacity-70">
                <img
                    src="https://www.gstatic.com/recaptcha/api2/logo_48.png"
                    alt="reCAPTCHA"
                    className="w-8 h-8 opacity-70"
                />
                <div className="flex flex-col items-center leading-none scale-[0.8] origin-right">
                    <span>reCAPTCHA</span>
                    <span className="text-[8px] mt-[1px]">Privacy - Terms</span>
                </div>
            </div>
        </div>
    );
}
