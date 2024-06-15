import { Todo } from "./types";
import { FiCheckCircle } from "solid-icons/fi";
import { FiCircle } from "solid-icons/fi";
import { Show } from "solid-js";
import { VsClose } from "solid-icons/vs";

interface IProps {
    todo: Todo;
    toggleTodo: (id: number) => void;
    deleteTodo: (id: number) => void;
}

export default function TodoItem(props: IProps) {
    return (
        <div
            onclick={() => props.toggleTodo(props.todo.id)}
            class="w-full items-center box-border px-2 py-1 rounded hover:shadow-lg transition-all hover:cursor-pointer flex gap-4"
        >
            <Show when={props.todo.done} fallback={<FiCircle />}>
                <FiCheckCircle />
            </Show>
            <div class="w-full flex items-center justify-between mr-3">
                <h1
                    classList={{
                        "text-2xl": true,
                        "text-gray-400": props.todo.done,
                        "line-through": props.todo.done,
                    }}
                >
                    {props.todo.name}
                </h1>
                <div
                    onclick={() => props.deleteTodo(props.todo.id)}
                    class="hover:cursor-pointer hover:bg-red-500 hover:text-white p-1 rounded-lg transition-all"
                >
                    <VsClose size={20} />
                </div>
            </div>
        </div>
    );
}
