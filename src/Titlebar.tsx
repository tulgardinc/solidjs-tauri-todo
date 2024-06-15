import { VsChromeMaximize } from "solid-icons/vs";
import { VsChromeMinimize } from "solid-icons/vs";
import { VsChromeClose } from "solid-icons/vs";
import { window as tauriWindow } from "@tauri-apps/api";

export default function Titlebar() {
    return (
        <div
            data-tauri-drag-region
            class="h-[30px] flex justify-end items-center box-border px-4"
        >
            <div class="flex gap-5">
                <VsChromeMinimize
                    class="hover:cursor-pointer"
                    onClick={() => tauriWindow.appWindow.minimize()}
                />
                <VsChromeMaximize
                    class="hover:cursor-pointer"
                    onClick={() => tauriWindow.appWindow.toggleMaximize()}
                />
                <VsChromeClose
                    class="hover:cursor-pointer "
                    onClick={() => tauriWindow.appWindow.close()}
                />
            </div>
        </div>
    );
}
