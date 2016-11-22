/**
 * Created by lievenj on 8-11-2016.
 */

/**
 * Created by lievenj on 8-11-2016.
 */

public class MyObject
{
    public String UniqueName {get;set;}

    public MyObject(String name)
    {
        this.UniqueName = name;
    }

    public Boolean equals(Object obj)
    {
        MyObject def = (MyObject)obj;
        return def.UniqueName == this.UniqueName;
    }

    public Integer hasCode()
    {
        return this.UniqueName.hashCode();
    }
}