import React from 'react';
import UserHeader from '../components/UserHeader';
import UserFooter from '../components/UserFooter';
import ContactHeader from '../components/ContactHeader';
import ContactForm from '../components/ContactForm';

const ContactPage = () => {
  return (
    <div className="flex flex-col items-center bg-[#F8F9FB] min-h-screen w-full">
      <UserHeader activePage="contact" />
      <main className="w-full max-w-[1216px] mx-auto px-8 pt-8">
        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-16 min-h-[858px]">
          <ContactHeader />
          <div className="lg:col-span-7 relative flex flex-col gap-12">
            <ContactForm />
            <div
              className="w-full h-[192px] rounded-lg overflow-hidden opacity-40 hover:opacity-70 transition-opacity z-10"
              style={{ border: '1px solid rgba(197, 198, 205, 0.2)' }}
            >
              <img
                className="w-full h-full object-cover"
                alt="Map showing Capital University location in Islamabad"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC4ggiaIah6zGwPGv0wKouFlPTSb6qXfpJ-wmPyNkhU8HuFZ6XtnJjGCll-ZG3ybS6Uz0NLZ1NUaHY1pSB6ETzPK0kYoo2-kw55bZm2Nj4mjB2DGxLIwFYWed5_ajFYbKIxW31FW_ZQaDXA76HqMoq_A6JekD7Wrs9CSrpxSDFZldOIFqj-wpCgiuhJ_wiBw2qVhP5E0eiSLUlU3OzEMN4-_hNoSjtgfQC9VCPsKpVwW5JsqI2cDe2JdZlNG6-b_IkEcIMBs50k3_A"
                style={{ backgroundBlendMode: 'saturation' }}
              />
            </div>
          </div>
        </div>
      </main>
      <UserFooter />
    </div>
  );
};

export default ContactPage;
