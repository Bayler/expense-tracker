'use client'

import { addDoc, collection, deleteDoc, doc, onSnapshot, query } from 'firebase/firestore';
import { useEffect, useState } from 'react'
import { db } from './firebase';

export default function Home() {
  const [items, setItems] = useState([
    // { name: 'Coffee', price: 4.95 },
    // { name: 'Movie', price: 24.95 },
    // { name: 'candy', price: 7.95 },
  ]);
  const [newItem, setNewItem] = useState({ name: '', price: ''})
  const [total, setTotal] = useState(0)

  // Add item to database
  const addItem = async (e) => {
    e.preventDefault();
    if (newItem.name !== '' && newItem.price !== '') {
      // setItems([...items, newItem]);
      await addDoc(collection(db, 'items'), {
        name: newItem.name.trim(),
        price: newItem.price,
      })
      setNewItem({ name: '', price: '' })
    }
  };

  // Read item from database
  useEffect(() => {
    const q = query(collection(db, 'items'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const itemsArr = [];

      querySnapshot.forEach((doc) => {
        itemsArr.push({...doc.data(), id:doc.id});
      });
      setItems(itemsArr);

      // Read total from itemsArr
      const calculateTotal = () => {
        const totalPrice = itemsArr.reduce(
          (sum, item) => sum + parseFloat(item.price),
          0
          );
          setTotal(totalPrice);
      };
      calculateTotal();
    return () => unsubscribe();
  });
  }, [])
  

  // Delete item from database
  const deleteItem = async (id) => {
    await deleteDoc(doc(db, 'items', id))
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 sm:p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className='text-4xl text-center'>Expense Tracker</h1>
        <div className='bg-slate-800 p-4 rounded-lg'>
          <form className='grid grid-cols-6 items-center text-black'>
            <input
              value={newItem.name} 
              onChange={(e) => setNewItem({...newItem, name:e.target.value})}
              type="text" 
              className="col-span-3 border p-3 outline-none" 
              placeholder='Enter Item'/>
            <input 
              value={newItem.price}
              onChange={(e) => setNewItem({...newItem, price:e.target.value})}
              type="number" 
              className='col-span-2 p-3 mx-3 outline-none' 
              placeholder='Enter $'/>
            <button 
              onClick={addItem}
              className="text-white bg-slate-950 hover:bg-slate-900 p-3 text-xl" 
              type="submit">
                +
            </button>
          </form>
          <ul>
            {items.map((item, id) => (
              <li key={id} className='my-4 w-full flex justify-between text-white bg-slate-950'>
                <div className='w-full p-4 flex justify-between'>
                  <span className='capitalize'>{item.name}</span>
                  <span>{item.price}</span>
                </div>
                <button 
                  onClick={() => deleteItem(item.id)}
                  className='ml-8 p-4 border-l-2 w-16 border-slate-900 hover:bg-slate-900'>
                    X
                </button>
              </li>
            ))}
          </ul>
          {items.length < 1 ? ('') : (
            <div className='flex justify-between p-3 text-white'>
              <span>Total</span>
              <span>${total}</span>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
