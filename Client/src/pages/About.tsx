import { motion } from 'motion/react';
import { 
  Users, 
  Target, 
  Lightbulb, 
  ShieldCheck, 
  ArrowLeft,
  Heart,
  Globe,
  Zap,
  UserCheck,
  Layout,
  Code,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const TEAM_MEMBERS = [
  { name: 'Bellah Yvonne Ombikhwa', id: '672569' },
  { name: 'Joyce Kimani', id: '670614' },
  { name: 'Delight Arvella', id: '670039' },
  { name: 'Maryanne Were', id: '672030' },
  { name: 'Tanga Joris', id: '670289' }
];

const About = () => {
  const navigate = useNavigate();

  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-brand-50 pt-20 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-16">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-brand-100 transition-colors text-brand-950"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-5xl font-serif font-bold text-brand-950">About Nteer</h1>
            <p className="text-brand-500 text-lg">Community Service Volunteer Monitoring System</p>
          </div>
        </div>

        {/* Introduction Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-serif font-bold text-brand-950 mb-6 leading-tight">
              Improving planning and <span className="serif-italic">efficiency</span> through real-time visibility.
            </h2>
            <p className="text-brand-600 text-lg leading-relaxed mb-6">
              NTeer is a web-based system designed to help community service students make informed decisions about where and when to volunteer.
            </p>
            <div className="p-6 bg-brand-950 rounded-3xl border border-brand-100 shadow-sm mb-8">
              <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-white" /> The Challenge
              </h4>
              <p className="text-sm text-white leading-relaxed">
                Students often arrive at sites only to find they are already full. This results in wasted time, frustration, and poor coordination between students and site supervisors.
              </p>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-video rounded-[3rem] overflow-hidden shadow-2xl">
              <img 
              src="volunteerNairobi.jpg"
                alt="Community Service" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>
        </div>

        {/* Personas Section */}
        <div className="mb-24">
          <div className="text-center mb-16">
            <h3 className="text-sm font-bold uppercase tracking-widest text-brand-400 mb-2">User Stories</h3>
            <h2 className="text-4xl font-serif font-bold text-brand-950">Our Personas</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Student Persona */}
            <div className="bg-white p-10 rounded-[3rem] border border-brand-100 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full overflow-hidden">
                  <img src="https://picsum.photos/seed/maria/100/100" alt="Maria" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-brand-950">Maria Wanjiku</h4>
                  <p className="text-sm text-brand-400">20 | University Student</p>
                </div>
              </div>
              <p className="text-sm text-brand-600 leading-relaxed mb-6 italic">
                "Maria registered late for her class and visited several sites only to find them full. Frustrated, she used Nteer to find a blue marker on the map and successfully completed her service."
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full w-fit">
                <CheckCircle2 className="w-4 h-4" /> Outcome: Found a site successfully
              </div>
            </div>

            {/* Supervisor Persona */}
            <div className="bg-white p-10 rounded-[3rem] border border-brand-100 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full overflow-hidden">
                  <img src="https://picsum.photos/seed/james/100/100" alt="James" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-brand-950">James Otieno</h4>
                  <p className="text-sm text-brand-400">45 | Site Supervisor</p>
                </div>
              </div>
              <p className="text-sm text-brand-600 leading-relaxed mb-6 italic">
                "James manages a children's home and wanted to attract hardworking volunteers. He used the Nteer dashboard to add a clear message to his site description, discouraging idlers."
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full w-fit">
                <CheckCircle2 className="w-4 h-4" /> Outcome: Attracted quality volunteers
              </div>
            </div>
          </div>
        </div>

        {/* Design Considerations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-24">
          <div className="lg:col-span-1">
            <h3 className="text-sm font-bold uppercase tracking-widest text-brand-400 mb-2">Philosophy</h3>
            <h2 className="text-3xl font-serif font-bold text-brand-950 mb-6">Key Design Considerations</h2>
            <p className="text-brand-500 text-sm leading-relaxed">
              We focused on creating a platform that feels natural and reduces the mental effort required to coordinate service.
            </p>
          </div>
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 bg-white rounded-[2.5rem] border border-brand-100 shadow-sm">
              <UserCheck className="w-8 h-8 text-brand-950 mb-4" />
              <h4 className="font-bold mb-2">User Familiarity</h4>
              <p className="text-xs text-brand-500 leading-relaxed">
                Navigation and color schemes resemble commonly used global apps, making the look and feel immediately familiar.
              </p>
            </div>
            <div className="p-8 bg-white rounded-[2.5rem] border border-brand-100 shadow-sm">
              <Layout className="w-8 h-8 text-brand-950 mb-4" />
              <h4 className="font-bold mb-2">Consistency</h4>
              <p className="text-xs text-brand-500 leading-relaxed">
                A consistent brown and white theme across all pages ensures availability indicators are never confusing.
              </p>
            </div>
            <div className="p-8 bg-white rounded-[2.5rem] border border-brand-100 shadow-sm">
              <Zap className="w-8 h-8 text-brand-950 mb-4" />
              <h4 className="font-bold mb-2">Reduced Cognitive Load</h4>
              <p className="text-xs text-brand-500 leading-relaxed">
                We avoid complex features that may confuse users, focusing on minimal duplication of functionality.
              </p>
            </div>
            <div className="p-8 bg-white rounded-[2.5rem] border border-brand-100 shadow-sm">
              <Code className="w-8 h-8 text-brand-950 mb-4" />
              <h4 className="font-bold mb-2">Real-Time Performance</h4>
              <p className="text-xs text-brand-500 leading-relaxed">
                Immediate updates of volunteer counts ensure students always have the most accurate data.
              </p>
            </div>
          </div>
        </div>

        {/* Challenges & Skills */}
        <div className="bg-brand-950 text-white rounded-[3rem] p-12 lg:p-20 mb-24 relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-3xl font-serif font-bold mb-8">Challenges Overcome</h2>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-brand-400" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm">Balancing Three User Needs</h5>
                    <p className="text-xs text-brand-400 mt-1">Designing for students, supervisors, and admins without favoring one group.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5 text-brand-400" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm">Real-Time Data Complexity</h5>
                    <p className="text-xs text-brand-400 mt-1">Ensuring accurate, live counts without technical delays or errors.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                    <Layout className="w-5 h-5 text-brand-400" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm">Visual Clarity vs. Density</h5>
                    <p className="text-xs text-brand-400 mt-1">Keeping the map simple while displaying capacity, reviews, and site info.</p>
                  </div>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="text-3xl font-serif font-bold mb-8">Skills Gained</h2>
              <div className="flex flex-wrap gap-3">
                {['User-Centered Design', 'Wireframing', 'Prototyping', 'Usability Testing', 'Collaboration', 'Problem-Solving'].map(skill => (
                  <span key={skill} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-medium">
                    {skill}
                  </span>
                ))}
              </div>
              <div className="mt-12 p-8 bg-brand-900 rounded-[2rem] border border-brand-800">
                <h4 className="font-serif font-bold text-xl mb-4">Ongoing Plans</h4>
                <ul className="space-y-3 text-sm text-brand-300">
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-brand-400 rounded-full" /> Push notifications</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-brand-400 rounded-full" /> Supervisor dashboard enhancements</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-brand-400 rounded-full" /> Review moderation system</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl" />
        </div>

        {/* The Team */}
        <div className="mb-24">
          <div className="text-center mb-16">
            <h3 className="text-sm font-bold uppercase tracking-widest text-brand-400 mb-2">The Minds Behind Nteer</h3>
            <h2 className="text-4xl font-serif font-bold text-brand-950">Meet Our Team</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {TEAM_MEMBERS.map((member) => (
              <motion.div 
                key={member.id}
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-3xl border border-brand-100 shadow-sm text-center"
              >
                <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-brand-950" />
                </div>
                <h4 className="font-bold text-brand-950 text-sm mb-1">{member.name}</h4>
                <p className="text-[10px] text-brand-400 font-mono uppercase tracking-tighter">ID: {member.id}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="text-center py-12">
          <h2 className="text-3xl font-serif font-bold text-brand-950 mb-6">Ready to make an impact?</h2>
          <button 
            onClick={() => navigate('/sites')}
            className="px-10 py-5 bg-brand-950 text-white rounded-2xl font-bold hover:bg-brand-800 transition-all shadow-xl"
          >
            Find a Site Now
          </button>
        </div>
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default About;
