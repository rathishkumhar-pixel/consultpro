'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Admin(){

  const [content,setContent] = useState({
    hero_title:'',
    hero_description:'',
    hero_button:''
  })

  const [categories,setCategories] = useState([])

  const [newCategory,setNewCategory] = useState('')

  const [message,setMessage] = useState('')

  useEffect(()=>{
    loadData()
  },[])

  async function loadData(){

    const { data:contentData } = await supabase
      .from('site_content')
      .select('*')
      .limit(1)
      .single()

    if(contentData){
      setContent(contentData)
    }

    const { data:categoryData } = await supabase
      .from('categories')
      .select('*')

    setCategories(categoryData || [])
  }

  async function saveContent(){

    const { data:existing } = await supabase
      .from('site_content')
      .select('*')
      .limit(1)

    let response

    if(existing && existing.length > 0){

      response = await supabase
        .from('site_content')
        .update({
          hero_title:content.hero_title,
          hero_description:content.hero_description,
          hero_button:content.hero_button
        })
        .eq('id', existing[0].id)

    } else {

      response = await supabase
        .from('site_content')
        .insert({
          hero_title:content.hero_title,
          hero_description:content.hero_description,
          hero_button:content.hero_button
        })

    }

    if(response.error){
      setMessage('Update failed')
    } else {
      setMessage('Updated successfully')
    }

  }

  async function addCategory(){

    if(!newCategory){
      return
    }

    const { error } = await supabase
      .from('categories')
      .insert({
        title:newCategory,
        description:'Consulting service',
        icon:'✨'
      })

    if(error){
      setMessage('Category add failed')
    } else {

      setMessage('Category added')

      setNewCategory('')

      loadData()
    }
  }

  return(

    <div
      style={{
        padding:'30px',
        fontFamily:'Arial'
      }}
    >

      <h1>ConsultPro CMS</h1>

      <div
        style={{
          background:'white',
          padding:'20px',
          borderRadius:'16px',
          marginTop:'20px',
          marginBottom:'20px'
        }}
      >

        <h2>Homepage Content</h2>

        <input
          placeholder="Hero title"
          value={content.hero_title || ''}
          onChange={(e)=>
            setContent({
              ...content,
              hero_title:e.target.value
            })
          }
          style={inputStyle}
        />

        <textarea
          placeholder="Hero description"
          value={content.hero_description || ''}
          onChange={(e)=>
            setContent({
              ...content,
              hero_description:e.target.value
            })
          }
          style={inputStyle}
        />

        <input
          placeholder="Button text"
          value={content.hero_button || ''}
          onChange={(e)=>
            setContent({
              ...content,
              hero_button:e.target.value
            })
          }
          style={inputStyle}
        />

        <button
          onClick={saveContent}
          style={buttonStyle}
        >
          Save Content
        </button>

      </div>

      <div
        style={{
          background:'white',
          padding:'20px',
          borderRadius:'16px'
        }}
      >

        <h2>Categories</h2>

        <input
          placeholder="New category"
          value={newCategory}
          onChange={(e)=>setNewCategory(e.target.value)}
          style={inputStyle}
        />

        <button
          onClick={addCategory}
          style={buttonStyle}
        >
          Add Category
        </button>

        <div
          style={{
            marginTop:'20px'
          }}
        >

          {categories.map((item)=>(

            <div
              key={item.id}
              style={{
                padding:'10px 0'
              }}
            >
              {item.icon} {item.title}
            </div>

          ))}

        </div>

      </div>

      <p
        style={{
          marginTop:'20px',
          color:'green'
        }}
      >
        {message}
      </p>

    </div>

  )
}

const inputStyle = {
  width:'100%',
  padding:'14px',
  marginBottom:'14px',
  borderRadius:'10px',
  border:'1px solid #ddd'
}

const buttonStyle = {
  background:'#2563eb',
  color:'white',
  border:'none',
  padding:'12px 20px',
  borderRadius:'10px',
  cursor:'pointer'
}