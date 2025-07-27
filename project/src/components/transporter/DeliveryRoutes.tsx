// import React, { useState, useEffect } from 'react';
// import { MapPin, Phone, Navigation, Clock, CheckCircle, Package } from 'lucide-react';

// interface VendorOrder {
//   id: string;
//   orderNumber: string;
//   items: Array<{
//     productName: string;
//     quantity: number;
//     unit: string;
//     price: number;
//   }>;
//   total: number;
//   status: string;
//   createdAt: Date;
//   deliveryAddress: string;
// }

// export default function DeliveryRoutes() {
//   const [selectedRoute, setSelectedRoute] = useState('ahmedabad');
//   const [vendorOrders, setVendorOrders] = useState<VendorOrder[]>([]);

//   // Load vendor orders for transportation
//   useEffect(() => {
//     const loadOrders = () => {
//       try {
//         const orders: VendorOrder[] = JSON.parse(localStorage.getItem('vendorOrders') || '[]');
//         setVendorOrders(orders.filter(order => 
//           order.status === 'pending' || order.status === 'processing'
//         ));
//       } catch (error) {
//         console.error('Error loading orders:', error);
//       }
//     };

//     loadOrders();
//     window.addEventListener('orderCreated', loadOrders);
    
//     return () => window.removeEventListener('orderCreated', loadOrders);
//   }, []);

// //   // Gujarat-based routes with real vendor orders
//   const gujaratRoutes = [
//     {
//       id: 'ahmedabad',
//       name: 'Ahmedabad Route',
//       city: 'Ahmedabad',
//       status: 'active',
//       areas: ['Maninagar', 'Vastrapur', 'Satellite', 'Navrangpura'],
//       deliveries: vendorOrders.slice(0, 2).map((order, index) => ({
//         id: order.orderNumber,
//         vendor: `Street Vendor ${index + 1}`,
//         phone: `+91 ${9000000000 + index}`,
//         address: `Shop ${index + 15}, ${['Maninagar Market', 'Vastrapur Circle'][index % 2]}, Ahmedabad`,
//         items: order.items.map(item => `${item.productName} (${item.quantity}${item.unit})`),
//         status: 'available',
//         scheduledTime: new Date(order.createdAt).toLocaleTimeString('en-IN', { 
//           hour: '2-digit', 
//           minute: '2-digit' 
//         }),
//         estimatedTime: new Date(Date.now() + (index + 1) * 30 * 60000).toLocaleTimeString('en-IN', { 
//           hour: '2-digit', 
//           minute: '2-digit' 
//         }),
//         priority: order.total > 100 ? 'high' : 'medium',
//         earnings: Math.round(order.total * 0.1),
//         distance: `${5 + index * 3} km`,
//         orderValue: order.total
//       }))
//     },
//     {
//       id: 'surat',
//       name: 'Surat Route',
//       city: 'Surat',
//       status: 'pending',
//       areas: ['Varachha', 'Adajan', 'Vesu', 'Rander'],
//       deliveries: vendorOrders.slice(2, 4).map((order, index) => ({
//         id: order.orderNumber,
//         vendor: `Local Vendor ${index + 1}`,
//         phone: `+91 ${9100000000 + index}`,
//         address: `Shop ${index + 25}, ${['Varachha Road', 'Adajan Market'][index % 2]}, Surat`,
//         items: order.items.map(item => `${item.productName} (${item.quantity}${item.unit})`),
//         status: 'available',
//         scheduledTime: new Date(order.createdAt).toLocaleTimeString('en-IN', { 
//           hour: '2-digit', 
//           minute: '2-digit' 
//         }),
//         estimatedTime: new Date(Date.now() + (index + 3) * 30 * 60000).toLocaleTimeString('en-IN', { 
//           hour: '2-digit', 
//           minute: '2-digit' 
//         }),
//         priority: order.total > 150 ? 'high' : 'medium',
//         earnings: Math.round(order.total * 0.1),
//         distance: `${8 + index * 4} km`,
//         orderValue: order.total
//       }))
//     },
//     {
//       id: 'vadodara',
//       name: 'Vadodara Route',
//       city: 'Vadodara',
//       status: 'pending',
//       areas: ['Alkapuri', 'Sayajigunj', 'Fatehgunj', 'Karelibaug'],
//       deliveries: vendorOrders.slice(4, 6).map((order, index) => ({
//         id: order.orderNumber,
//         vendor: `Food Vendor ${index + 1}`,
//         phone: `+91 ${9200000000 + index}`,
//         address: `Shop ${index + 35}, ${['Alkapuri Market', 'Sayaji Circle'][index % 2]}, Vadodara`,
//         items: order.items.map(item => `${item.productName} (${item.quantity}${item.unit})`),
//         status: 'available',
//         scheduledTime: new Date(order.createdAt).toLocaleTimeString('en-IN', { 
//           hour: '2-digit', 
//           minute: '2-digit' 
//         }),
//         estimatedTime: new Date(Date.now() + (index + 5) * 30 * 60000).toLocaleTimeString('en-IN', { 
//           hour: '2-digit', 
//           minute: '2-digit' 
//         }),
//         priority: 'medium',
//         earnings: Math.round(order.total * 0.1),
//         distance: `${6 + index * 2} km`,
//         orderValue: order.total
//       }))
//     }
//   ];

//   const currentRoute = gujaratRoutes.find(route => route.id === selectedRoute);
  
//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'delivered':
//         return 'bg-green-100 text-green-800';
//       case 'picked':
//         return 'bg-blue-100 text-blue-800';
//       case 'available':
//         return 'bg-yellow-100 text-yellow-800';
//       default:
//         return 'bg-gray-100 text-gray-800';
//     }
//   };

//   const getPriorityColor = (priority: string) => {
//     switch (priority) {
//       case 'high':
//         return 'bg-red-100 text-red-800';
//       case 'medium':
//         return 'bg-yellow-100 text-yellow-800';
//       case 'low':
//         return 'bg-green-100 text-green-800';
//       default:
//         return 'bg-gray-100 text-gray-800';
//     }
//   };

//   const handleAcceptOrder = (deliveryId: string) => {
//     console.log(`Accepting order ${deliveryId}`);
//     // Update order status in localStorage
//     try {
//       const orders = JSON.parse(localStorage.getItem('vendorOrders') || '[]');
//       const updatedOrders = orders.map((order: VendorOrder) => 
//         order.orderNumber === deliveryId 
//           ? { ...order, status: 'assigned' }
//           : order
//       );
//       localStorage.setItem('vendorOrders', JSON.stringify(updatedOrders));
      
//       // Trigger update
//       window.dispatchEvent(new CustomEvent('orderUpdated'));
//     } catch (error) {
//       console.error('Error accepting order:', error);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h2 className="text-2xl font-bold text-gray-900">Gujarat Delivery Routes</h2>
//         <div className="text-sm text-gray-600">
//           Optimized for minimum cost transportation in Gujarat
//         </div>
//       </div>

//       <div className="grid lg:grid-cols-3 gap-6">
//         {/* Route Selection */}
//         <div className="lg:col-span-1">
//           <div className="bg-white p-6 rounded-xl shadow-sm">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Cities</h3>
//             <div className="space-y-3">
//               {gujaratRoutes.map((route) => (
//                 <button
//                   key={route.id}
//                   onClick={() => setSelectedRoute(route.id)}
//                   className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
//                     selectedRoute === route.id
//                       ? 'border-purple-300 bg-purple-50'
//                       : 'border-gray-200 hover:border-gray-300'
//                   }`}
//                 >
//                   <div className="flex items-center justify-between mb-2">
//                     <h4 className="font-medium text-gray-900">{route.name}</h4>
//                     <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${
//                       route.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
//                     }`}>
//                       {route.status}
//                     </span>
//                   </div>
//                   <div className="text-sm text-gray-600 mb-1">
//                     {route.deliveries.length} orders available
//                   </div>
//                   <div className="text-xs text-gray-500">
//                     Areas: {route.areas.join(', ')}
//                   </div>
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>
// {/* 
//         {/* Route Details */}
//         {/* <div className="lg:col-span-2">
//           {currentRoute && ( */}
// {/* //             <div className="space-y-6">
// //               {/* Route Header */}
// //               <div className="bg-white p-6 rounded-xl shadow-sm">
// //                 <div className="flex items-center justify-between mb-4">
// //                   <h3 className="text-xl font-semibold text-gray-900">{currentRoute.name}</h3>
// //                   <div className="flex items-center space-x-3">
// //                     <button className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
// //                       <Navigation className="w-4 h-4" />
// //                       <span>Navigate</span>
// //                     </button>
// //                     <button className="flex items-center space-x-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
// //                       <MapPin className="w-4 h-4" />
// //                       <span>View Map</span>
// //                     </button>
// //                   </div>
// //                 </div>
                
// //                 <div className="grid grid-cols-3 gap-4 text-center">
// //                   <div>
// //                     <div className="text-2xl font-bold text-gray-900">{currentRoute.deliveries.length}</div>
// //                     <div className="text-sm text-gray-600">Total Stops</div>
// //                   </div>
// //                   <div>
// //                     <div className="text-2xl font-bold text-blue-600">
// //                       {currentRoute.deliveries.filter(d => d.status === 'picked').length}
// //                     </div>
// //                     <div className="text-sm text-gray-600">Picked Up</div>
// //                   </div>
// //                   <div>
// //                     <div className="text-2xl font-bold text-green-600">
// //                       {currentRoute.deliveries.filter(d => d.status === 'delivered').length}
// //                     </div>
// //                     <div className="text-sm text-gray-600">Delivered</div>
// //                   </div>
// //                 </div>
// //               </div>

// //               {/* Delivery List */}
// {/* //               {currentRoute.deliveries.length === 0 ? ( */} */}
// {/* //                 <div className="bg-white p-8 rounded-xl shadow-sm text-center">
// //                   <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
// //                   <h4 className="text-lg font-medium text-gray-900 mb-2">No Orders Available</h4>
// //                   <p className="text-gray-600">New delivery requests in {currentRoute.city} will appear here.</p>
// //                 </div>
// //               ) : ( */}
// {/* //                 <div className="space-y-4">
// //                     <div key={delivery.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
// //                       <div className="p-6">
// //                         <div className="flex items-start justify-between mb-4">
// //                           <div className="flex items-start space-x-4">
// //                             <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
//                               delivery.status === 'delivered' ? 'bg-green-500' : */}
//                               {/* delivery.status === 'picked' ? 'bg-blue-500' :
//                               'bg-yellow-500'
//                             }`}>
//                               {index + 1}
//                             </div>
//                             <div>
//                               <h4 className="text-lg font-semibold text-gray-900">Order #{delivery.id}</h4>
//                               <div className="flex items-center space-x-2 text-gray-600 mt-1">
//                                 <MapPin className="w-4 h-4" />
//                                 <span className="text-sm">{delivery.address}</span>
//                               </div>
//                               <div className="flex items-center space-x-2 text-gray-600 mt-1">
//                                 <Phone className="w-4 h-4" />
//                                 <span className="text-sm">{delivery.phone}</span>
//                               </div>
//                             </div>
//                           </div> */}
                          
// {/* //                           <div className="flex flex-col items-end space-y-2">
// //                             <div className="text-right">
// //                               <div className="text-lg font-bold text-green-600">₹{delivery.earnings}</div>
// //                               <div className="text-xs text-gray-500">Transport Fee</div>
// //                             </div>
// //                             <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusColor(delivery.status)}`}>
// //                               {delivery.status}
// //                             </span>
// //                             <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getPriorityColor(delivery.priority)}`}>
// //                               {delivery.priority} priority
// //                             </span>
// //                           </div>
// //                         </div> */}

// //                         {/* Order Details */}
// {/* //                         <div className="grid md:grid-cols-2 gap-4 mb-4">
// //                           <div>
// //                             <h5 className="font-medium text-gray-900 mb-2">Items to Deliver</h5>
// //                             <div className="space-y-1">
// //                               {delivery.items.map((item, itemIndex) => (
// //                                 <div key={itemIndex} className="flex items-center text-sm text-gray-600">
// //                                   <Package className="w-3 h-3 mr-2" />
// //                                   {item}
// //                                 </div> */}
// {/* //                               ))}
// //                             </div>
// //                           </div>
// //                            */}
// {/* // //                           <div>
// // //                             <h5 className="font-medium text-gray-900 mb-2">Timing & Distance</h5>
// // //                             <div className="space-y-2 text-sm">
// // //                               <div className="flex items-center text-gray-600">
// // //                                 <Clock className="w-4 h-4 mr-2" />
// // //                                 <span>Scheduled: {delivery.scheduledTime}</span>
// // //                               </div>
// // //                               <div className="flex items-center text-gray-600">
// // //                                 <Clock className="w-4 h-4 mr-2" />
// // //                                 <span>ETA: {delivery.estimatedTime}</span>
// // //                               </div>
// //                               <div className="flex items-center text-gray-600">
// //                                 <MapPin className="w-4 h-4 mr-2" />
// //                                 <span>Distance: {delivery.distance}</span>
// //                               </div>
// //                               <div className="flex items-center text-gray-600">
// //                                 <Package className="w-4 h-4 mr-2" />
// //                                 <span>Order Value: ₹{delivery.orderValue}</span>
// //                               </div>
// //                             </div>
// //                           </div>
// //                         </div>

// //                         {/* Action Buttons */}
// {/* //                         <div className="flex items-center justify-between pt-4 border-t">
// //                           <div className="text-xs text-gray-500">
// //                             Optimized route for minimum cost in {currentRoute.city}
// //                           </div>
                          
// //                           <div className="flex space-x-2">
// //                             {delivery.status === 'available' && ( */} */}
// //                               <>
// {/* //                                 <button 
// //                                   onClick={() => handleAcceptOrder(delivery.id)}
// //                                   className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition-colors"
// //                                 > */}
// {/* //                                   Accept Order
// //                                 </button>
// //                                 <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-50 transition-colors">
// //                                   Get Directions
// //                                 </button>
// //                               </>
// //                             )}
// //                             {delivery.status === 'picked' && (
// //                               <> */}
// {/* //                                 <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors">
// //                                   <CheckCircle className="w-4 h-4 inline mr-1" />
// //                                   Mark as Delivered
// //                                 </button>
// //                                 <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-50 transition-colors">
// //                                   Call Vendor
// //                                 </button>
// //                               </>
//                   //           )} */
//                   {/* //         </div>
//                   //       </div>
//                   //     </div> */}
//                   //   </div>
//                   // ))}
// //                 </div>
// //               )}
// //             </div>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// //                       <div className="grid md:grid-cols-2 gap-6 mb-4">
// //                         <div>
// //                           <h5 className="font-medium text-gray-900 mb-2">Items to Deliver</h5>
// //                           <div className="space-y-1">
// //                             {delivery.items.map((item, itemIndex) => (
// //                               <div key={itemIndex} className="flex items-center space-x-2 text-sm text-gray-600">
// //                                 <Package className="w-4 h-4" />
// //                                 <span>{item}</span>
// //                               </div>
// //                             ))}
// //                           </div>
// //                         </div>
                        
// //                         <div>
// //                           <h5 className="font-medium text-gray-900 mb-2">Timing</h5>
// //                           <div className="space-y-1 text-sm text-gray-600">
// //                             <div className="flex items-center space-x-2">
// //                               <Clock className="w-4 h-4" />
// //                               <span>Scheduled: {delivery.scheduledTime}</span>
// //                             </div>
// //                             <div className="flex items-center space-x-2">
// //                               <Clock className="w-4 h-4" />
// //                               <span>ETA: {delivery.estimatedTime}</span>
// //                             </div>
// //                           </div>
// //                         </div>
// //                       </div>

// //                       {/* Action Buttons */}
// //                       <div className="border-t pt-4">
// //                         <div className="flex flex-wrap gap-2">
// //                           {delivery.status === 'pending' && (
// //                             <button
// //                               onClick={() => handleStatusUpdate(delivery.id, 'picked')}
// //                               className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
// //                             >
// //                               <Package className="w-4 h-4" />
// //                               <span>Mark as Picked</span>
// //                             </button>
// //                           )}
                          
// //                           {delivery.status === 'picked' && (
// //                             <button
// //                               onClick={() => handleStatusUpdate(delivery.id, 'delivered')}
// //                               className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
// //                             >
// //                               <CheckCircle className="w-4 h-4" />
// //                               <span>Mark as Delivered</span>
// //                             </button>
// //                           )}
                          
// //                           <button className="flex items-center space-x-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
// //                             <Phone className="w-4 h-4" />
// //                             <span>Call Vendor</span>
// //                           </button>
                          
// //                           <button className="flex items-center space-x-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
// //                             <Navigation className="w-4 h-4" />
// //                             <span>Get Directions</span>
// //                           </button>
// //                         </div>
// //                       </div>
// //                     </div>
// //                   </div>
// //                 ))}
// //               </div>
// //             </div>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // } */}