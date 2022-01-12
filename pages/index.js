import {Netmask} from "netmask";
import {useEffect, useState} from "react";
import {insert} from "lodash";



class TreeNode {
    constructor(value, children = []) {
        this.parent = parent;
        this.value = value;
        this.children = children;
    }
}

const getNetmask = cidr => {
    const block = new Netmask(cidr);
    // console.log({
    //     input: cidr,
    //     output: block,
    // })
    return block;
}

const childToParent = {};

const Home = () => {

    const [rootTreeNode, setRootTreeNode] = useState(null);

    const [cidr, setCidr] = useState("192.168.0.0/24");

    const [subnets, setSubnets] = useState([])

    useEffect(() => {

        const root = new TreeNode(getNetmask(cidr));
        


setSubnets([getNetmask(cidr)])
    }, [])

    const onSubmit = e => {
        e.preventDefault();
        setSubnets([getNetmask(cidr)])
    }

    const divide = origin => {
        const block1 = getNetmask(`${origin.base}/${origin.bitmask + 1}`);
        const block2 = block1.next();
        childToParent[`${block1.base}/${block1.bitmask}`] = origin;
        childToParent[`${block2.base}/${block2.bitmask}`] = origin;

        const newSubnetList = [...subnets];
        const originIndex = newSubnetList.findIndex((item) => {
            return item === origin;
        });

        newSubnetList.splice(originIndex, 1, block1);
        newSubnetList.splice(originIndex + 1, 0, block2);
        setSubnets([...newSubnetList])
    }


    const hasRowsToJoin = Object.keys(childToParent).length > 0;

    return (
        <div>
            <h1>Subnet Calculator</h1>
            <div>
                <label>Network address</label>
                <input type="text" value={cidr} onChange={e => setCidr(e.target.value)} />
            </div>
            <div>
                <button type="submit" onClick={onSubmit}>Submit</button>
                <button>Reset</button>
            </div>
            <hr />
            <table border={1}>
                <thead>
                <tr>
                    <th>Subnet address</th>
                    <th>Netmask</th>
                    <th>Address range</th>
                    <th>Usable IPs</th>
                    <th>Hosts</th>
                    <th>Divide</th>
                    {hasRowsToJoin && (<th>Join</th>)}
                </tr>
                </thead>
                <tbody>
                {subnets.map(subnet => (
                    <tr key={`${subnet.netLong}${subnet.maskLong}`}>
                        <td>{`${subnet.base}/${subnet.bitmask}`}</td>
                        <td>{subnet.mask}</td>
                        <td>{`${subnet.base}`}{subnet.bitmask < 32 && `- ${subnet.broadcast || subnet.last}`}</td>
                        <td>{`${subnet.first}`}{subnet.bitmask < 32 && `- ${subnet.last}`}</td>
                        <td>{subnet.bitmask === 32 ? 1 : subnet.bitmask === 31 ? 2 : subnet.size - 2}</td>
                        <td>
                            <button disabled={subnet.bitmask === 32} onClick={() => divide(subnet)}>Divide</button>    
                        </td>
                        {hasRowsToJoin && (
                            <td rowSpan={2}>
                            <button>Join</button>
                        </td>
                        )}
                        
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    )
}

export default Home;