import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t bg-white dark:bg-black py-8 px-6">
      <div className="max-w-[1280px] mx-auto flex flex-col items-center justify-between gap-3 md:flex-row md:gap-0">
        <p className="text-center text-sm leading-relaxed text-gray-500 dark:text-gray-400 md:text-left max-w-[700px]">
          Built by{" "}
          <Link
            href="https://drive.google.com/file/d/1z4cY8zIcPJeDenqpOwEV4PMF_wb4tl3p/view?usp=sharing"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4 hover:text-[#40916c] dark:hover:text-[#8bc34a] transition-colors duration-200"
          >
            LaLiMa Team
          </Link>
          . The source code is available on{" "}
          <Link
            href="https://github.com/ScarXiFy/carolinian-events"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4 hover:text-[#40916c] dark:hover:text-[#8bc34a] transition-colors duration-200"
          >
            GitHub
          </Link>
          .
        </p>
      </div>
    </footer>
  )
}
