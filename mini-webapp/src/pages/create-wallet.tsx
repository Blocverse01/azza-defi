import { Info, LogoSm, WhatsappIcon3 } from "../assets";
import React from "react";
import Logo from "../assets/logo.svg";
import Image from "next/image";
import { subjectivityFont } from "../font/setup";
import Faq from "../components/Faq";

const CreateWallet = () => {
  return (
    <div
      className={`${subjectivityFont.variable} font-inter bg-az-primary-green`}
    >
      <section
        className={
          "relative  hero-background mt text-white py-4 px-6 md:px-[120px] "
        }
      >
        <Image src={Logo as string} alt='logo' />
        <div
          className={
            "flex relative z-10 mt-[43px] flex-col max-w-[845px] mx-auto space-y-[32px] md:space-y-[44px]"
          }
        >
          <div className={"flex justify-center space-x-3 items-center "}>
            <WhatsappIcon3 />
            <p>{">>>>>>>>>>>>>"}</p>
            <LogoSm />
          </div>
          <p className='font-subj leading-[28px] md:leading-[54px] uppercase text-center text-[32px] md:text-[56px]'>
            You&apos;re about to{" "}
            <span className={" text-az-primary-yellow "}>create a wallet</span>{" "}
            on <span className={" text-az-secondary-green-1 "}>Azza </span>
          </p>
          <p
            className={
              "max-w-[485px] md:text-[20px] leading-[24px] md:leading-[28px] text-center mx-auto"
            }
          >
            Hi, John Doe. Kindly click on the button below to continue creating
            a wallet on AZZA.
          </p>

          <button
            className={
              "bg-white py-[10px] px-[16px] rounded-[10px] text-black w-fit  mx-auto"
            }
          >
            Create a Wallet
          </button>
        </div>
        <div
          className={
            " max-w-[600px] mx-auto mt-[135px]  flex space-x-4 text-black bg-az-secondary-green-1 p-5 rounded-t-[20px]  "
          }
        >
          <Info />
          <div className={" flex flex-col space-y-[3px]"}>
            <p className={"uppercase font-subj text-[24px] font-[800px] "}>
              What is Azza?
            </p>
            <p className={"text-[20px]"}>
              AZZA is a WhatsApp bot which helps you move your funds between
              crypto and fiat easily (all on WhatsApp).
            </p>
          </div>
        </div>
      </section>
      <section className={"mt-[87px] "}>
        <div className={"footerbg1 px-[24px]"}>
          <p
            className={
              " text-az-primary-yellow font-extrabold text-center leading-[28px] md:leading-[48px] text-[32px] md:text-[48px] "
            }
          >
            FREQUENTLY ASKED QUESTIONS
          </p>
          <Faq />
        </div>
      </section>
    </div>
  );
};

export default CreateWallet;
