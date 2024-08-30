import { Accordion } from "flowbite-react";


export default function Projects() {
  return (
    <div className='min-h-screen max-w-2xl mx-auto flex  items-center flex-col gap-6 p-3'>
      <h1 className='text-3xl font-semibold'>Smart Ledning</h1>
      <p className='text-md text-gray-500'><strong>Tài chính thông minh - tương lai vững vàng</strong></p>
      <h1 className='text-2xl font-semibold'>Các câu hỏi thường gặp</h1>
      <Accordion collapseAll>
        <Accordion.Panel>
          <Accordion.Title>Thời gian duyệt hồ sơ bao lâu?</Accordion.Title>
          <Accordion.Content>
            <p className="mb-2 text-gray-500 dark:text-gray-400">
              Quá trình duyệt hỗ sơ sẽ mất khoảng 60 phút tính từ lúc bạn hoàn thành gửi hồ sơ đến chúng tôi
            </p>
            <p className="text-gray-500 dark:text-gray-400">
              Hãy chú ý theo dõi thông báo ở phần Khoản vay của bạn nhé!!!
            </p>
          </Accordion.Content>
        </Accordion.Panel>
        <Accordion.Panel>
          <Accordion.Title>Cấp hạng của người vay được xác định từ đâu?</Accordion.Title>
          <Accordion.Content>
            <p className="mb-2 text-gray-500 dark:text-gray-400">
              Cấp hạng của người dùng ảnh hưởng khá nhiều đến các yếu tố khác, cấp hạng càng cao sẽ có nhiều ưu đãi về lãi suất, khoản trả góp
            </p>
            <p className="mb-2 text-gray-500 dark:text-gray-400">
              Nếu số tiền lớn hơn hoặc bằng 25000 USD sẽ được xếp vào lớp G,
            </p>
            <p className="mb-2 text-gray-500 dark:text-gray-400">

              Nếu số tiền vay lớn hơn hoặc bằng 20000 USD sẽ được xếp vào lớp F,

            </p>
            <p className="mb-2 text-gray-500 dark:text-gray-400">


              Nếu số tiền vay lớn hơn hoặc bằng 17000 USD sẽ được xếp vào lớp E,

            </p>
            <p className="mb-2 text-gray-500 dark:text-gray-400">



              Nếu số tiền vay lớn hơn hoặc bằng 15000 USD sẽ được xếp vào lớp D,

            </p>
            <p className="mb-2 text-gray-500 dark:text-gray-400">



              Nếu số tiền vay lớn hơn hoặc bằng 12500 USD sẽ được xếp vào lớp C,

            </p>
            <p className="mb-2 text-gray-500 dark:text-gray-400">



              Nếu số tiền vay lớn hơn hoặc bằng 10000 USD sẽ được xếp vào lớp B,
            </p>
            <p className="mb-2 text-gray-500 dark:text-gray-400">


              Nếu số tiền vay bé hơn hoặc bằng 17000 USD sẽ được xếp vào lớp A,

            </p>
          </Accordion.Content>
        </Accordion.Panel>
        <Accordion.Panel>
          <Accordion.Title>Điểm tín dụng được đánh giá như thế nào?</Accordion.Title>
          <Accordion.Content>
            <p className="mb-2 text-gray-500 dark:text-gray-400">
              Điểm tín dụng sẽ được đánh giá dựa vào mức độ uy tín của bạn trong quá trình thực hiện nghĩa vụ thanh toán khoản vay và các yếu tố khác.
            </p>
          </Accordion.Content>
        </Accordion.Panel>
        <Accordion.Panel>
          <Accordion.Title>Lãi suất được tính ra sao?</Accordion.Title>
          <Accordion.Content>
            <p className="mb-2 text-gray-500 dark:text-gray-400">
              Lãi suất được tính dựa theo cấp hạng của người dùng:
            </p>
            <p className="mb-2 text-gray-500 dark:text-gray-400">
              A: 7.1,
              B: 10.6,
              C: 14.0,
              D: 17.7,
              E: 21.1,
              F: 24.9,
              G: 27.7
            </p>

          </Accordion.Content>
        </Accordion.Panel>
      </Accordion>
    </div>
  )
}