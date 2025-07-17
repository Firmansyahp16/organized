import { uniqueId } from "lodash";
import { marked } from "marked";
import { useEffect } from "react";
import { Block, parseMarkdown, serializeMarkdown } from "../libs/mdHelper";
import Card from "./Card";

export function MDBuilder({
  blocks,
  setBlocks,
  defaultMarkdown,
}: {
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  defaultMarkdown?: string;
}) {
  function updateBlock(index: number, updated: Block) {
    const clone = [...blocks];
    clone[index] = updated;
    setBlocks(clone);
  }

  function removeBlock(index: number) {
    const clone = [...blocks];
    clone.splice(index, 1);
    setBlocks(clone);
  }

  function addBlock(type: Block["type"]) {
    const newBlock: Block =
      type === "list"
        ? { id: uniqueId(), type, value: [""] }
        : type === "link"
        ? { id: uniqueId(), type, value: "", url: "" }
        : { id: uniqueId(), type, value: "" };

    setBlocks((prev: Block[]) => [...prev, newBlock]);
  }

  useEffect(() => {
    if (defaultMarkdown && blocks.length === 0) {
      const parsed = parseMarkdown(defaultMarkdown);
      setBlocks(parsed);
    }
  }, [defaultMarkdown, setBlocks]);

  return (
    <Card expanded>
      <div className="grid grid-cols-2 gap-2 min-w-full justify-center">
        {(["heading", "paragraph", "list", "link"] as Block["type"][]).map(
          (type) => (
            <>
              <button
                key={type}
                className="btn btn-outline btn-sm capitalize btn-primary"
                onClick={() => addBlock(type)}
              >
                Add {type}
              </button>
            </>
          )
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 h-[60vh]">
        <div className="grid gap-2 overflow-y-auto p-2 border prose max-w-full">
          {blocks.map((block, i) => (
            <div
              key={block.id}
              className="p-4 border rounded-md space-y-2 bg-base-100 shadow-sm relative"
            >
              <button
                className="absolute top-2 right-2 btn btn-xs btn-error text-white"
                onClick={() => removeBlock(i)}
              >
                Remove
              </button>

              <div className="text-xs font-semibold text-gray-500 uppercase">
                {block.type}
              </div>

              {block.type === "heading" && (
                <input
                  className="input input-bordered w-full"
                  placeholder="Heading text"
                  value={block.value}
                  onChange={(e) =>
                    updateBlock(i, { ...block, value: e.target.value })
                  }
                />
              )}

              {block.type === "paragraph" && (
                <textarea
                  className="textarea textarea-bordered w-full"
                  placeholder="Paragraph text"
                  value={block.value}
                  onChange={(e) =>
                    updateBlock(i, { ...block, value: e.target.value })
                  }
                />
              )}

              {block.type === "list" && (
                <div className="space-y-2">
                  {block.value.map((item, idx) => (
                    <>
                      <input
                        key={idx}
                        className="input input-bordered w-full"
                        placeholder={`Item ${idx + 1}`}
                        value={item}
                        onChange={(e) => {
                          const updatedItems = [...block.value];
                          updatedItems[idx] = e.target.value;
                          updateBlock(i, { ...block, value: updatedItems });
                        }}
                      />
                      <span>
                        <button
                          className="btn btn-xs btn-error text-white"
                          onClick={() => {
                            const updatedItems = block.value.filter(
                              (_, itemIndex) => itemIndex !== idx
                            );
                            updateBlock(i, { ...block, value: updatedItems });
                          }}
                        >
                          Delete
                        </button>
                      </span>
                    </>
                  ))}
                  <button
                    className="btn btn-xs btn-outline mx-2"
                    onClick={() =>
                      updateBlock(i, {
                        ...block,
                        value: [...block.value, ""],
                      })
                    }
                  >
                    Add item
                  </button>
                </div>
              )}

              {block.type === "link" && (
                <>
                  <input
                    className="input input-bordered w-full"
                    placeholder="Text to display"
                    value={block.value}
                    onChange={(e) =>
                      updateBlock(i, { ...block, value: e.target.value })
                    }
                  />
                  <input
                    className="input input-bordered w-full mt-2"
                    placeholder="https://example.com"
                    value={block.url}
                    onChange={(e) =>
                      updateBlock(i, { ...block, url: e.target.value })
                    }
                  />
                </>
              )}
            </div>
          ))}
        </div>
        <article className="prose max-w-full border overflow-y-auto p-2">
          <div
            dangerouslySetInnerHTML={{
              __html: marked(serializeMarkdown(blocks)),
            }}
          />
        </article>
      </div>
    </Card>
  );
}
