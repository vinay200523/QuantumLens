import { DocumentInput } from '../types';

export const SAMPLE_DOCUMENTS: DocumentInput[] = [
  // --- GROUP 1: Superconducting Quantum Hardware (DOC_01, DOC_02, DOC_03) ---
  {
    doc_id: 'DOC_01',
    title: 'IBM Unveils 1121-Qubit Condor Processor and Quantum System Two',
    text: 'IBM Quantum has officially announced the Condor processor boasting 1121 superconducting transmon qubits with advanced cryogenic dilution packaging. Operating at temperatures near 15 millikelvin inside a dilution refrigerator the chip demonstrates a significant milestone in qubit density and nanoscale fabrication. Condor incorporates high-density cryogenic wiring and flexible interconnect cables to control thousands of microwave pulses simultaneously. Alongside Condor IBM unveiled Quantum System Two a modular infrastructure designed to link multiple superconducting quantum processors via microwave communication channels. While Condor pushes scale engineering benchmarks highlight that coherent gate fidelity, crosstalk suppression, and qubit coherence time remain critical hurdles for commercial superconducting quantum processors.',
    source: 'IBM Research News',
    publication_date: '2023-12-04'
  },
  {
    doc_id: 'DOC_02',
    title: 'Google Quantum AI Demonstrates Sycamore Qubit Coherence Scaling',
    text: 'Researchers at Google Quantum AI have published experimental results showcasing enhanced coherence times across the superconducting Sycamore architecture. By engineering superconducting transmon coplanar waveguide resonators with tantalum metallization inside cryogenic dilution systems the team suppressed dielectric surface losses and two-level defect fluctuations. The superconducting processor achieves single-qubit gate fidelities exceeding 99.9 percent and two-qubit cross-resonance gate fidelities of 99.4 percent. The publication outlines scalable microwave pulse shaping techniques that minimize transient phase errors and stray microwave crosstalk during simultaneous multi-qubit benchmarking. Google emphasizes that increasing qubit coherence time while scaling physical superconducting transmon qubits is paramount for fault-tolerant quantum processors.',
    source: 'Nature Physics',
    publication_date: '2024-02-18'
  },
  {
    doc_id: 'DOC_03',
    title: 'Rigetti Computing Deploys 84-Qubit Ankaa-2 Superconducting System',
    text: 'Rigetti Computing has deployed its 84-qubit Ankaa-2 superconducting quantum computing system featuring a modular multi-chip square lattice topology. Ankaa-2 incorporates tunable capacitive couplers between superconducting transmon qubits to actively dial and eliminate parasitic microwave interactions that cause unwanted phase shifts. The chip achieved a 2.5x reduction in two-qubit error rates compared to its previous generation reaching a median two-qubit gate fidelity of 98 percent inside cryogenic dilution refrigerators. Rigetti leverages planar silicon lithography and flip-chip packaging to isolate microwave control lines from sensitive superconducting quantum circuits, enabling scalable gate fidelity across multi-chip superconducting processors.',
    source: 'Rigetti Press Release',
    publication_date: '2024-01-11'
  },

  // --- GROUP 2: Neutral Atom & Trapped-Ion Atomic Hardware (DOC_04, DOC_05) ---
  {
    doc_id: 'DOC_04',
    title: 'QuEra Computing Achieves Breakthrough in 256 Neutral Atom Rydberg Arrays',
    text: 'QuEra Computing and academic collaborators demonstrated programmable quantum processing with 256 neutral rubidium atoms suspended in optical tweezer arrays. The atomic quantum processor utilizes highly excited Rydberg states to produce strong long-range dipole interactions for multi-qubit laser entangling gates. Using dynamic spatial light modulators researchers repositioned individual trapped atoms in real time during circuit execution to establish all-to-all connectivity. This laser-driven optical trapping approach circumvents the cryogenic complexity of superconducting transmons and offers homogeneous qubit properties across thousands of neutral atoms, advancing atomic quantum processor architectures with high gate fidelity.',
    source: 'Physical Review X',
    publication_date: '2023-11-20'
  },
  {
    doc_id: 'DOC_05',
    title: 'Quantinuum Announces 56-Qubit H2-1 Trapped-Ion Processor',
    text: 'Quantinuum has upgraded its H2-1 atomic quantum processor featuring 56 ytterbium ion qubits trapped in a microfabricated surface electrode trap. The trapped-ion atomic architecture utilizes laser-driven optical entangling gates achieving average two-qubit gate fidelities of 99.85 percent across all trapped pairs. Physical shuttling of individual ions through segmented radio-frequency zones allows arbitrary all-to-all connectivity without requiring nearest-neighbor swap networks. Quantinuum verified a record-breaking quantum volume confirming exceptional circuit depth and minimal gate noise in laser-driven atomic quantum processors with long coherence times.',
    source: 'Quantum Science and Technology',
    publication_date: '2024-03-05'
  },

  // --- GROUP 3: Quantum Error Correction & Logical Qubits (DOC_06, DOC_07, DOC_08, DOC_09) ---
  {
    doc_id: 'DOC_06',
    title: 'Harvard and QuEra Demonstrate Fault-Tolerant Quantum Computing with 48 Logical Qubits',
    text: 'A landmark experiment led by Harvard University alongside QuEra Computing MIT and NIST has demonstrated fault-tolerant quantum computation using 48 logical qubits. The researchers encoded logical qubits within hundreds of physical atoms arranged in zoned architectures. Using transversal two-qubit logical gates and dynamic mid-circuit syndrome measurements the system executed complex quantum circuits while suppressing physical errors below fault-tolerant thresholds. The experiment achieved logical entangling gates with lower error rates than the underlying physical constituent operations, verifying the fundamental promise of quantum error correction codes for reliable logical qubits.',
    source: 'Nature',
    publication_date: '2023-12-06'
  },
  {
    doc_id: 'DOC_07',
    title: 'Surface Codes and Real-Time Syndrome Decoding Slash Logical Error Rates',
    text: 'Advances in planar surface code quantum error correction have achieved a key milestone: suppressing logical qubit errors exponentially by scaling code distances. Researchers utilized a distance-5 planar surface code to monitor stabilizer syndrome measurements in real time. Fast classical FPGA decoders mapped weight-four parity checks and identified bit-flip and phase-flip error chains using minimum-weight perfect matching algorithms. By performing non-destructive syndrome measurements every 200 nanoseconds the system detected and corrected physical errors before they compromised the encoded logical qubits, proving fault-tolerant quantum error correction scalability.',
    source: 'IEEE Transactions on Quantum Engineering',
    publication_date: '2024-01-29'
  },
  {
    doc_id: 'DOC_08',
    title: 'Microsoft and Quantinuum Synthesize Reliable Logical Qubits Using Topological QEC',
    text: 'Microsoft Azure Quantum and Quantinuum reported a joint milestone in creating reliable logical qubits with an active quantum error correction diagnostic system. Operating on trapped-ion hardware Microsoft applied qubit-virtualization algorithms to execute over 14000 individual syndrome check experiments without a single undetected logical error. The system achieved an 800-fold reduction in error rate compared to physical constituent operations. Surface code encodings combined with non-destructive syndrome measurements allowed the processor to distinguish true quantum phase flips from classical readout noise, demonstrating fault-tolerant logical qubits for scientific discovery.',
    source: 'Microsoft Azure Quantum Blog',
    publication_date: '2024-04-03'
  },
  {
    doc_id: 'DOC_09',
    title: 'Fault-Tolerant Qubit Overhead and Magic State Distillation Bounds',
    text: 'A theoretical analysis examines the physical resource overhead required for universal fault-tolerant quantum computation using quantum error correction. Because planar surface codes natively support only Clifford gates non-Clifford operations require magic state distillation routines that consume substantial physical qubit resources to protect logical qubits. The study models factory architectures where thousands of noisy ancilla qubits are consumed to produce high-fidelity magic states for logical quantum error correction circuits. Novel lattice surgery techniques and surface code decoding reduce distillation footprint and latency for fault-tolerant logical processors.',
    source: 'PRX Quantum',
    publication_date: '2024-02-12'
  },

  // --- GROUP 4: Quantum Algorithms & Optimization (DOC_10, DOC_11, DOC_12) ---
  {
    doc_id: 'DOC_10',
    title: 'Optimizing Shor Algorithm for Prime Factorization on Fault-Tolerant Quantum Hardware',
    text: 'Computer scientists have presented optimized circuit compilation methods for Shor algorithm to achieve prime factorization on fault-tolerant quantum processors. By restructuring modular exponentiation using windowed arithmetic and reversible carry-ripple adders the authors trimmed the required logical execution steps for factoring cryptographic keys. The revised quantum algorithm architecture analyzes the trade-off between parallelized look-ahead adder circuits and temporal memory footprints. These concrete quantum algorithm resource estimates provide rigorous benchmarks for evaluating asymptotic quantum speedup over classical algorithms.',
    source: 'ACM Communications in Computer Systems',
    publication_date: '2024-02-25'
  },
  {
    doc_id: 'DOC_11',
    title: 'Quantum Approximate Optimization Algorithm Benchmarked for Industrial Max-Cut Problems',
    text: 'A comprehensive empirical study evaluated the performance of the Quantum Approximate Optimization Algorithm (QAOA) across dense and sparse Max-Cut combinatorial graph problem instances. Researchers compared classical heuristics against multi-layer QAOA quantum algorithms executed on quantum hardware. The research investigated barren plateaus in parameter landscapes and analyzed gradient-based classical optimizer convergence during classical-quantum outer loops. Increasing circuit depth enables approximation ratios that demonstrate practical quantum algorithm speedup for combinatorial optimization problems over classical heuristics.',
    source: 'Journal of Heuristics and Quantum Optimization',
    publication_date: '2024-01-15'
  },
  {
    doc_id: 'DOC_12',
    title: 'Variational Quantum Eigensolver Calculates Ground State Energy of Molecular Dimers',
    text: 'Computational chemists deployed the Variational Quantum Eigensolver (VQE) algorithm to simulate electronic structure and ground state energies of nitrogenase molecular clusters. Using unitary coupled cluster trial state ansatzes the team mapped fermionic Hamiltonians onto qubit operators. The variational quantum algorithm optimizes parameterized quantum circuits in a hybrid classical-quantum loop to achieve chemical accuracy within 1.6 millihartrees. The results demonstrate the power of hybrid variational quantum algorithms for molecular ground state simulation and complex chemical optimization.',
    source: 'Journal of Chemical Physics',
    publication_date: '2023-11-30'
  },

  // --- GROUP 5: Post-Quantum Cryptography & Key Security (DOC_13, DOC_14, DOC_15) ---
  {
    doc_id: 'DOC_13',
    title: 'NIST Standardizes Post-Quantum Cryptographic Algorithms to Counter Decryption Threat',
    text: 'The National Institute of Standards and Technology (NIST) has finalized its initial suite of post-quantum cryptography standards designed to protect digital communications against quantum decryption threats. The standardized public-key encryption mechanism is ML-KEM based on the CRYSTALS-Kyber lattice cryptography suite. Digital signature standards include ML-DSA derived from CRYSTALS-Dilithium. NIST emphasized that quantum computers executing Shor algorithm will compromise legacy RSA and elliptic curve public-key cryptography, requiring urgent enterprise migration to post-quantum cryptographic standards to guarantee digital security.',
    source: 'NIST Information Technology Laboratory',
    publication_date: '2024-08-13'
  },
  {
    doc_id: 'DOC_14',
    title: 'Transitioning Enterprise Infrastructure to Kyber and Dilithium Post-Quantum Protocols',
    text: 'Cybersecurity engineers have published deployment guidelines for integrating NIST post-quantum cryptography algorithms into enterprise transport layer security protocols. The transition addresses the urgent threat of harvest-now decrypt-later espionage where adversaries store encrypted traffic to decrypt once cryptanalytically relevant quantum computers exist. Hybrid key exchange combining classical Diffie-Hellman with ML-KEM Kyber-768 ensures defense-in-depth against emerging quantum threats. Enterprises are urged to conduct cryptographic discovery and migrate legacy asymmetric encryption to post-quantum cryptographic standards.',
    source: 'IEEE Security and Privacy',
    publication_date: '2024-03-22'
  },
  {
    doc_id: 'DOC_15',
    title: 'Quantum Key Distribution Satellite Network Establishes Entanglement-Based Global Security',
    text: 'A consortium of telecommunications researchers completed a multi-city test of satellite-to-ground quantum key distribution (QKD) utilizing polarization-entangled photon pairs. Low Earth orbit satellites equipped with optical tracking terminals beamed single photons down to atmospheric ground stations at secure bit rates. By leveraging quantum key distribution and quantum cryptography any eavesdropping interception introduces measurable quantum bit error rates that immediately alert endpoints. The network successfully demonstrated provably secure post-quantum cryptographic key distribution between geographically dispersed data centers.',
    source: 'Optica',
    publication_date: '2024-02-08'
  },

  // --- GROUP 6: Industrial Engineering & Chemical Simulation Applications (DOC_16, DOC_17, DOC_18) ---
  {
    doc_id: 'DOC_16',
    title: 'JPMorgan and QC Ware Deploy Quantum Algorithms for Portfolio Optimization and Risk Hedging',
    text: 'JPMorgan Chase in collaboration with QC Ware deployed specialized industrial quantum computing applications to optimize multi-asset investment portfolios and calculate Value-at-Risk under market volatility shocks. The team benchmarked quantum amplitude estimation for pricing complex financial derivative contracts, demonstrating theoretical quadratic speedup over classical numerical techniques. In parallel, quantum constrained optimization algorithms were tested to identify optimal equity allocations subject to liquidity constraints, establishing production readiness for industrial financial quantum computing applications.',
    source: 'Financial Times Tech Review',
    publication_date: '2023-10-18'
  },
  {
    doc_id: 'DOC_17',
    title: 'Quantum Computing Accelerates Catalyst Discovery for Industrial Green Ammonia Production',
    text: 'Materials science researchers in chemical manufacturing have deployed industrial quantum computing applications to investigate reaction mechanisms for green ammonia synthesis. Using quantum phase estimation and molecular simulation algorithms the team computed transition state barrier energies for catalytic nitrogen bond cleavage at ambient temperatures. Replacing the fossil-fuel intensive Haber-Bosch process with sustainable electrochemical catalysts demonstrates the transformative commercial potential of industrial quantum computing applications for chemical manufacturing.',
    source: 'Green Chemistry and Sustainability',
    publication_date: '2024-01-05'
  },
  {
    doc_id: 'DOC_18',
    title: 'BMW Group Leverages Hybrid Quantum Machine Learning for Automotive Aerodynamics',
    text: 'The BMW Group demonstrated industrial quantum computing applications using hybrid quantum machine learning models for automotive aerodynamic optimization and structural battery simulations. Researchers embedded parameterized quantum circuits into classical neural network pipelines to evaluate aerodynamic drag coefficients of electric vehicle chassis designs. The industrial quantum computing application enhanced feature representation in turbulent airflow datasets without model overfitting, shortening prototyping cycles and delivering competitive engineering advantages.',
    source: 'Automotive Engineering International',
    publication_date: '2023-12-14'
  },

  // --- GROUP 7: Classical Exascale Supercomputing Contrast (DOC_19, DOC_20) ---
  {
    doc_id: 'DOC_19',
    title: 'Oak Ridge National Laboratory Frontier Exascale Supercomputer Solves Classical Molecular Dynamics',
    text: 'Oak Ridge National Laboratory reported record-breaking scientific simulations running on the Frontier exascale classical supercomputer powered by over 37000 AMD Instinct GPUs. Delivering more than 1.1 exaflops of sustained double-precision performance Frontier executed all-atom classical molecular dynamics simulations with over one billion atoms. The classical supercomputer leverages message passing interface communication, high-bandwidth memory, and Cray interconnect bandwidth to sustain massive classical numerical throughput. High-performance computing engineers emphasized that classical exascale supercomputers set the global standard for heavy classical scientific simulations.',
    source: 'HPCwire',
    publication_date: '2023-11-15'
  },
  {
    doc_id: 'DOC_20',
    title: 'Frontier and Aurora Exascale Classical Supercomputers Lead Global TOP500 Performance Rankings',
    text: 'The latest edition of the TOP500 global supercomputer rankings confirmed the undisputed computational leadership of classical exascale supercomputers Frontier and Aurora. Located at Oak Ridge and Argonne National Laboratories these massive classical architectures consume megawatts of electrical power to execute trillions of floating-point operations using dense clusters of classical x86 CPUs and GPU accelerators. Supercomputing benchmarks including Linpack demonstrated extraordinary efficiency in traditional parallel classical computing workloads. Computer scientists emphasized that classical exascale supercomputers remain the workhorse of scientific computation.',
    source: 'Top500 News',
    publication_date: '2024-04-10'
  }
];
