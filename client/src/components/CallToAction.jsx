import { Button } from 'flowbite-react';

export default function CallToAction() {
  return (
    <div className='flex flex-col sm:flex-row p-3 border border-teal-500 justify-center items-center rounded-tl-3xl rounded-br-3xl text-center'>
        <div className="flex-1 justify-center flex flex-col">
            <h2 className='text-2xl'>
            <span className='px-2 py-1 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg text-white'>Smart</span>
            Lending
            </h2>
            <p className='text-gray-500 my-2'>
                Tài chính thông minh - tương lai vững vàng
            </p>
            <Button gradientDuoTone='greenToBlue' className='rounded-tl-xl rounded-bl-none'>
                <a href="https://www.100jsprojects.com" target='_blank' rel='noopener noreferrer'>
                    100 JavaScript Projects
                </a>
            </Button>
        </div>
        <div className="p-7 flex-1">
            <img src="https://i.pinimg.com/564x/4c/c2/13/4cc213d6b951e2b5c1e5cb527c0e6f42.jpg" />
        </div>
    </div>
  )
}