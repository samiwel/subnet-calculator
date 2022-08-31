// @ts-check

import {Netmask} from "netmask";
import {useEffect, useState} from "react";


class TreeNode {
    /**
     * @param {Netmask} value
     * @param {Netmask?} parent
     */
    constructor(value, parent=null) {
        this.parent = parent;
        this.value = value;
    }

    get cidr() {
        return `${this.value.base}/${this.value.bitmask}`
    }
    
}

const getNetmask = (cidr) => {
    const block = new Netmask(cidr);
    return block;
}

const childToParent = {};

const Home = () => {

    const [rootTreeNode, setRootTreeNode] = useState(null);

    const [cidr, setCidr] = useState("192.168.0.0/24");

    const [subnets, setSubnets] = useState([])

    useEffect(() => {
        const root = new TreeNode(getNetmask(cidr));
        setSubnets([root])
    }, [])

    const onSubmit = e => {
        e.preventDefault();
        setSubnets([getNetmask(cidr)])
    }

    const divide = origin => {
        const block1 = new TreeNode(getNetmask(`${origin.base}/${origin.bitmask + 1}`), origin);
        const block2 = new TreeNode(block1.value.next(), origin);
        childToParent[block1.cidr] = origin;
        childToParent[block2.cidr] = origin;

        const newSubnetList = [...subnets];
        const originIndex = newSubnetList.findIndex((item) => {
            return item.value.cidr === origin.cidr;
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
                {rootTreeNode && (
                    <tr>
                        <td>{`${rootTreeNode.value.base}/${rootTreeNode.value.bitmask}`}</td>
                        <td>{rootTreeNode.value.mask}</td>
                        <td>{`${rootTreeNode.value.base}`}{rootTreeNode.value.bitmask < 32 && `- ${rootTreeNode.value.broadcast || rootTreeNode.value.last}`}</td>
                        <td>{`${rootTreeNode.value.first}`}{rootTreeNode.value.bitmask < 32 && `- ${rootTreeNode.value.last}`}</td>
                        <td>{rootTreeNode.value.bitmask === 32 ? 1 : rootTreeNode.value.bitmask === 31 ? 2 : rootTreeNode.value.size - 2}</td>
                        <td>
                            <button disabled={rootTreeNode.value.bitmask === 32} onClick={() => divide(rootTreeNode.value)}>Divide</button>    
                        </td>
                    </tr>
                )}


                {subnets.map(subnet => (
                    <tr key={`${subnet.value.netLong}${subnet.value.maskLong}`}>
                        <td>{`${subnet.value.base}/${subnet.value.bitmask}`}</td>
                        <td>{subnet.value.mask}</td>
                        <td>{`${subnet.value.base}`}{subnet.value.bitmask < 32 && `- ${subnet.value.broadcast || subnet.value.last}`}</td>
                        <td>{`${subnet.value.first}`}{subnet.value.bitmask < 32 && `- ${subnet.value.last}`}</td>
                        <td>{subnet.value.bitmask === 32 ? 1 : subnet.value.bitmask === 31 ? 2 : subnet.value.size - 2}</td>
                        <td>
                            <button disabled={subnet.value.bitmask === 32} onClick={() => divide(subnet.value)}>Divide</button>    
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