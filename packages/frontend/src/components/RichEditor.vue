<template>
  <div class="rich-editor">
    <editor-content :editor="editor" />
  </div>
</template>

<script setup lang="ts">
import { watch, onBeforeUnmount } from "vue";
import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";

const props = withDefaults(defineProps<{ modelValue?: string }>(), {
  modelValue: "",
});
const emit = defineEmits<{ "update:modelValue": [value: string] }>();

const editor = useEditor({
  content: props.modelValue,
  extensions: [StarterKit],
  onUpdate({ editor: e }) {
    emit("update:modelValue", e.getHTML());
  },
});

watch(
  () => props.modelValue,
  (v) => {
    if (editor.value && editor.value.getHTML() !== v) {
      editor.value.commands.setContent(v || "", false);
    }
  },
);

onBeforeUnmount(() => editor.value?.destroy());
</script>

<style lang="scss" scoped>
.rich-editor {
  :deep(.ProseMirror) {
    min-height: 50px;
    outline: none;
    border: 1px solid #ccc;
    padding: 8px;
  }
}
</style>
