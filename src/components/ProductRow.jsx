import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Trash2, Edit3, Check } from "lucide-react";

export default function ProductRow({ index, product, onDelete, onUpdated }) {
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(product.price);
  const [stock, setStock] = useState(product.stock);

  const updateProduct = async () => {
    const { error } = await supabase
      .from("products")
      .update({ name, price, stock })
      .eq("id", product.id);
    if (!error) {
      setEdit(false);
      onUpdated();
    }
  };

  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="p-3">{index}</td>
      <td className="p-3">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-16 h-16 object-cover rounded-lg"
          />
        ) : (
          "—"
        )}
      </td>
      <td className="p-3">
        {edit ? (
          <input
            className="border rounded-lg px-2 py-1 w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        ) : (
          product.name
        )}
      </td>
      <td className="p-3">
        {edit ? (
          <input
            type="number"
            className="border rounded-lg px-2 py-1 w-24"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        ) : (
          `₺${product.price}`
        )}
      </td>
      <td className="p-3">
        {edit ? (
          <input
            type="number"
            className="border rounded-lg px-2 py-1 w-16"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />
        ) : (
          product.stock
        )}
      </td>
      <td className="p-3">
        {edit ? (
          <button
            onClick={updateProduct}
            className="inline-flex items-center gap-1 text-green-600 hover:text-green-800"
          >
            <Check size={16} /> Kaydet
          </button>
        ) : (
          <>
            <button
              onClick={() => setEdit(true)}
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 mr-3"
            >
              <Edit3 size={16} /> Düzenle
            </button>
            <button
              onClick={onDelete}
              className="inline-flex items-center gap-1 text-red-600 hover:text-red-800"
            >
              <Trash2 size={16} /> Sil
            </button>
          </>
        )}
      </td>
    </tr>
  );
}
