
import { FC } from "react";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { KPCKoordinat } from '../../../../../services/types';
import MarkerClusterGroup from 'react-leaflet-cluster'
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Button } from "@/components/ui/button";
import { context } from "../../../../../store";
import PopupDetail from "./PopupDetail";

interface MapsI {
    dataSource: Array<KPCKoordinat>
    isLoading: boolean
}
const Maps:FC<MapsI> = ({dataSource,isLoading})=>{
    const ctx = context()
    const indonesiaCenter: L.LatLngExpression = [-2.548926, 118.014863];

    const getIcon = () => {
        return L.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });
    };

    const onClickDetail = (data: KPCKoordinat)=> {
        return ctx.dispatch({
            isModal: {
                title: 'Detail KCP',
                type: 'modal',
                component: <PopupDetail data={data}/>
            }
        })
    }
    
    // browser code
    return (
        <MapContainer 
            center={indonesiaCenter} 
            zoom={5} 
            style={{ height: '100vh', width: '100%' }} 
            scrollWheelZoom={true}
        >
            <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MarkerClusterGroup
                chunkedLoading
            >
                {dataSource && dataSource.length > 0 && !isLoading && dataSource.map((kpc) => (
                kpc.koordinat_latitude && kpc.koordinat_longitude && (
                    <Marker
                    key={kpc.id_kpc}
                    position={[parseFloat(kpc.koordinat_latitude) || -0, parseFloat(kpc.koordinat_longitude)|| -0]}
                    icon={getIcon()}
                    >
                    <Popup>
                        <div>
                            <strong>{kpc.nama}</strong><br />
                            Provinsi ID: {kpc.id_provinsi}
                        </div>
                        <div className="flex justify-center mt-3">
                            <Button 
                                variant={'secondary'} 
                                size={'sm'}
                                onClick={()=>onClickDetail(kpc)}
                            >
                                Lihat Detail
                            </Button>
                        </div>
                    </Popup>
                    </Marker>
                )
                ))}
            </MarkerClusterGroup>
            {/* {isLoading && (
                <div>Loading...</div>
            )} */}
    </MapContainer>
    );
}

export default Maps