import React from 'react'
import Header from '../../components/Header'
import { sanityClient, urlFor } from '../../sanity'
import { Post } from '../../TypeValidation'
import PortableText from 'react-portable-text'
import { useForm, SubmitHandler } from "react-hook-form";

interface Props {
    post: Post;
}

type Inputs = {
    _id: string,
    name: string,
    email: string,
    comment: string,
  };
const Post = ({post}: Props) => {
    const { register, handleSubmit, watch, formState: { errors } } = useForm<Inputs>();
    const onSubmit: SubmitHandler<Inputs> = data => console.log(data);
    console.log("post ", post)
    return (
    <main>
    <Header />
        <img 
        className='w-full h-40 object-cover'
        src={urlFor(post.mainImage).url()!}
         alt={post.title}   
        />
        <article className='max-w-3xl mx-auto p-5'>
            <h1 className='text-3xl mt-10 mb-3'>{post.title}</h1>
            <h2 className='text-2xl font-light text-gray-500 mb-2'>{post.description}</h2>
            <div className='flex space-x-3 items-center'>
                <img 
                className='h-10 w-10 rounded-full'
                src={urlFor(post.author.image).url()!}
                alt={post.author.name}
                />
                <p className='font-extralight text-sm'>
                    Blog post by <span className='font-bold text-green-600 cursor-pointer'> {post.author.name}</span> - published at {" "}
                    {new Date(post._createdAt).toLocaleString()}
                </p>
            </div>
            <div>
                <PortableText
                className='mt-10'
                dataset={process.env.NEXT_PUBLIC_SANITY_DATASET!}
                projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!}
                content={post.body}
                serializers={
                    {
                        h1: (props: any) => 
                            <h1 className='text-2xl font-bold my-5' {...props}/>,
                        
                        h2: (props: any) => 
                            <h2 className='text-xl font-bold my-5' {...props}/>,
                        li: ({children}: any) => 
                            <li className='ml-4 list-disc' >{children}</li>
                        ,
                        link: ({href, children}: any) => 
                            <a href={href} className='text-blue-500 hover:underline' >{children}</a>
                        
                    }
                }
                />
            </div>
        </article>
        <hr className='max-w-lg my-5 mx-auto border border-green-600'/>
        <form className='flex flex-col p-5 max-w-2xl mx-auto mb-10' onSubmit={handleSubmit(onSubmit)}>
            <h3 className='text-sm text-green-600'>Enjoyed this article?</h3>
            <h4 className='text-3xl font-bold'>Leave a comment below</h4>
            <hr className='py-3 mt-2' />
            <input 
            {...register("_id")}
                type="hidden"
                name="_id"
                value={post._id}
            />
            <label className='block mb-5'>
                <span className='text-gray-700'>Name</span>
                <input className='shadow border rounded py-2 px-3 form-input mt-1 block w-full ring-green-500 outline-none focus:ring' 
                {...register("name", {required: true})}
                 name="name" type="text" placeholder='Your Name' 
                
                />
            </label>
            <label className='block mb-5'>
                <span className='text-gray-700'>Email</span>
                <input className='shadow border rounded py-2 px-3 form-input mt-1 block w-full ring-green-500 outline-none focus:ring'
                {...register("email", {required: true})}
                 type="email" name="email" placeholder='Your Email'  />
            </label>
            <label className='block mb-5'>
                <span className='text-gray-700'>Comment</span>
                <textarea className='shadow border rounded py-2 px-3 form-textarea mt-1 block w-full ring-green-500 outline-none focus:ring'
                {...register("comment", {required: true})}
                placeholder='Comment' name="comment" rows={8} />
            </label>
            <div className=' flex flex-col p-5'>
                <ol>
                {errors.name && (
                    <li className='text-red-500'>The Name Field is Required</li>
                )}
                {errors.email && (
                    <li className='text-red-500'>The Email Field is Required</li>
                )}
                {errors.comment && (
                    <li className='text-red-500'>The Comment Field is Required</li>
                )}

                </ol>
                <input type="submit"
                className='w-full shadow bg-green-500 hover:bg-green-400 focus:shadow-outline
                focus:outloine-none text-white font-bold py-2 px-4 rounded cursor-pointer'
                />
            </div>
        </form>
    </main>
  )
}

export default Post

export const getStaticPaths = async () => {
    const query = `*[_type == "post"]{
        _id,
        slug {
            current
        }
    }`;

    const posts = await sanityClient.fetch(query);
    const paths = posts.map((post: Post) =>({
        params: {
            slug: post.slug.current
        }
    }));

    console.log("paths post ", paths);

    return {
        paths,
        fallback: 'blocking'

    }

}

export const getStaticProps: GetStaticProps =  async ({params}) => {
    const query = `*[_type == 'post' && slug.current == $slug][0]{   _id,
        _createdAt,
        title,
        description,
        author -> {
                    id,
                    name,
                    image
                  },
        mainImage,
        'comments': *[
            _type == 'comment' &&
            post._ref == ^._id &&
            approved == true],
        body,
       slug,
                 
    }`;

    const post = await sanityClient.fetch(query, {slug: params?.slug,})

    console.log("static post ", post);

    if(!post) {
        return {
            notFound: true
        }
    }

    return {
        props: {
            post,
        },
        revalidate: 10, // In sec
    }



    
}